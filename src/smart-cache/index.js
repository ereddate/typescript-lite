import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 智能缓存配置
const CACHE_CONFIG = {
  // 缓存目录
  CACHE_DIR: process.env.TSL_CACHE_DIR || join(process.cwd(), '.tsl-cache'),
  
  // 内存缓存配置
  MEMORY_CACHE: {
    MAX_SIZE: 1000,
    TTL: 3600000, // 1小时（毫秒）
    CLEANUP_THRESHOLD: 0.8
  },
  
  // 磁盘缓存配置
  DISK_CACHE: {
    MAX_SIZE: 100 * 1024 * 1024, // 100MB
    TTL: 86400000, // 24小时（毫秒）
    COMPRESSION: true
  },
  
  // 依赖跟踪配置
  DEPENDENCY_TRACKING: {
    ENABLED: true,
    MAX_DEPENDENCIES: 1000
  }
};

// 文件依赖图
class DependencyGraph {
  constructor() {
    this.dependencies = new Map(); // 文件 -> 依赖列表
    this.dependents = new Map(); // 文件 -> 被依赖列表
  }

  /**
   * 添加依赖关系
   */
  addDependency(file, dependency) {
    if (!this.dependencies.has(file)) {
      this.dependencies.set(file, new Set());
    }
    this.dependencies.get(file).add(dependency);
    
    if (!this.dependents.has(dependency)) {
      this.dependents.set(dependency, new Set());
    }
    this.dependents.get(dependency).add(file);
  }

  /**
   * 获取文件的依赖
   */
  getDependencies(file) {
    return this.dependencies.get(file) || new Set();
  }

  /**
   * 获取被依赖的文件
   */
  getDependents(file) {
    return this.dependents.get(file) || new Set();
  }

  /**
   * 移除文件及其依赖关系
   */
  removeFile(file) {
    const dependencies = this.getDependencies(file);
    dependencies.forEach(dep => {
      const dependents = this.getDependents(dep);
      dependents.delete(file);
    });
    
    const dependents = this.getDependents(file);
    dependents.forEach(dep => {
      const deps = this.getDependencies(dep);
      deps.delete(file);
    });
    
    this.dependencies.delete(file);
    this.dependents.delete(file);
  }

  /**
   * 获取受影响的文件（级联更新）
   */
  getAffectedFiles(changedFile) {
    const affected = new Set();
    const queue = [changedFile];
    
    while (queue.length > 0) {
      const current = queue.shift();
      const dependents = this.getDependents(current);
      
      dependents.forEach(dep => {
        if (!affected.has(dep)) {
          affected.add(dep);
          queue.push(dep);
        }
      });
    }
    
    return affected;
  }

  /**
   * 清空依赖图
   */
  clear() {
    this.dependencies.clear();
    this.dependents.clear();
  }
}

// 智能缓存类
class SmartCache {
  constructor(options = {}) {
    this.config = { ...CACHE_CONFIG, ...options };
    this.memoryCache = new Map();
    this.diskCache = new Map();
    this.dependencyGraph = new DependencyGraph();
    this.initialized = false;
  }

  /**
   * 初始化缓存
   */
  async initialize() {
    if (this.initialized) return;
    
    // 创建缓存目录
    if (!existsSync(this.config.CACHE_DIR)) {
      mkdirSync(this.config.CACHE_DIR, { recursive: true });
    }
    
    // 加载磁盘缓存元数据
    await this.loadDiskCacheMetadata();
    
    this.initialized = true;
  }

  /**
   * 生成缓存键
   */
  generateKey(code, options = {}) {
    const hash = createHash('sha256');
    hash.update(code);
    hash.update(JSON.stringify(options));
    return hash.digest('hex');
  }

  /**
   * 生成文件缓存键
   */
  generateFileKey(filePath, options = {}) {
    const hash = createHash('sha256');
    hash.update(filePath);
    hash.update(JSON.stringify(options));
    return hash.digest('hex');
  }

  /**
   * 获取内存缓存
   */
  getMemoryCache(key) {
    const item = this.memoryCache.get(key);
    if (!item) return null;
    
    // 检查是否过期
    if (Date.now() - item.timestamp > this.config.MEMORY_CACHE.TTL) {
      this.memoryCache.delete(key);
      return null;
    }
    
    // 更新访问时间（LRU）
    item.timestamp = Date.now();
    return item.value;
  }

  /**
   * 设置内存缓存
   */
  setMemoryCache(key, value) {
    // 检查缓存大小
    if (this.memoryCache.size >= this.config.MEMORY_CACHE.MAX_SIZE * this.config.MEMORY_CACHE.CLEANUP_THRESHOLD) {
      this.cleanupMemoryCache();
    }
    
    this.memoryCache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  /**
   * 清理内存缓存
   */
  cleanupMemoryCache() {
    const entries = Array.from(this.memoryCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const itemsToRemove = Math.floor(entries.length * (1 - this.config.MEMORY_CACHE.CLEANUP_THRESHOLD));
    for (let i = 0; i < itemsToRemove; i++) {
      this.memoryCache.delete(entries[i][0]);
    }
  }

  /**
   * 获取磁盘缓存
   */
  async getDiskCache(key) {
    const cachePath = join(this.config.CACHE_DIR, `${key}.json`);
    
    if (!existsSync(cachePath)) return null;
    
    try {
      const data = readFileSync(cachePath, 'utf8');
      const item = JSON.parse(data);
      
      // 检查是否过期
      if (Date.now() - item.timestamp > this.config.DISK_CACHE.TTL) {
        this.removeDiskCache(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('读取磁盘缓存失败:', error);
      return null;
    }
  }

  /**
   * 设置磁盘缓存
   */
  async setDiskCache(key, value) {
    const cachePath = join(this.config.CACHE_DIR, `${key}.json`);
    
    try {
      const item = {
        value,
        timestamp: Date.now()
      };
      
      writeFileSync(cachePath, JSON.stringify(item), 'utf8');
      
      // 更新磁盘缓存元数据
      this.diskCache.set(key, {
        size: Buffer.byteLength(JSON.stringify(item)),
        timestamp: Date.now()
      });
      
      // 检查磁盘缓存大小
      await this.checkDiskCacheSize();
    } catch (error) {
      console.error('写入磁盘缓存失败:', error);
    }
  }

  /**
   * 移除磁盘缓存
   */
  removeDiskCache(key) {
    const cachePath = join(this.config.CACHE_DIR, `${key}.json`);
    
    if (existsSync(cachePath)) {
      try {
        const fs = require('fs');
        fs.unlinkSync(cachePath);
        this.diskCache.delete(key);
      } catch (error) {
        console.error('删除磁盘缓存失败:', error);
      }
    }
  }

  /**
   * 加载磁盘缓存元数据
   */
  async loadDiskCacheMetadata() {
    const fs = require('fs');
    const files = fs.readdirSync(this.config.CACHE_DIR);
    
    let totalSize = 0;
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = join(this.config.CACHE_DIR, file);
        const stats = statSync(filePath);
        const key = file.replace('.json', '');
        
        this.diskCache.set(key, {
          size: stats.size,
          timestamp: stats.mtime.getTime()
        });
        
        totalSize += stats.size;
      }
    }
    
    // 如果超过大小限制，清理旧缓存
    if (totalSize > this.config.DISK_CACHE.MAX_SIZE) {
      await this.cleanupDiskCache();
    }
  }

  /**
   * 检查磁盘缓存大小
   */
  async checkDiskCacheSize() {
    const totalSize = Array.from(this.diskCache.values())
      .reduce((sum, item) => sum + item.size, 0);
    
    if (totalSize > this.config.DISK_CACHE.MAX_SIZE) {
      await this.cleanupDiskCache();
    }
  }

  /**
   * 清理磁盘缓存
   */
  async cleanupDiskCache() {
    const entries = Array.from(this.diskCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    let totalSize = Array.from(this.diskCache.values())
      .reduce((sum, item) => sum + item.size, 0);
    
    const targetSize = this.config.DISK_CACHE.MAX_SIZE * 0.8;
    
    for (const [key, item] of entries) {
      if (totalSize <= targetSize) break;
      
      this.removeDiskCache(key);
      totalSize -= item.size;
    }
  }

  /**
   * 获取缓存
   */
  async get(key) {
    await this.initialize();
    
    // 先检查内存缓存
    const memoryValue = this.getMemoryCache(key);
    if (memoryValue !== null) {
      return memoryValue;
    }
    
    // 再检查磁盘缓存
    const diskValue = await this.getDiskCache(key);
    if (diskValue !== null) {
      // 将磁盘缓存加载到内存缓存
      this.setMemoryCache(key, diskValue);
      return diskValue;
    }
    
    return null;
  }

  /**
   * 设置缓存
   */
  async set(key, value) {
    await this.initialize();
    
    // 设置内存缓存
    this.setMemoryCache(key, value);
    
    // 设置磁盘缓存
    await this.setDiskCache(key, value);
  }

  /**
   * 删除缓存
   */
  async delete(key) {
    this.memoryCache.delete(key);
    this.removeDiskCache(key);
  }

  /**
   * 清空所有缓存
   */
  async clear() {
    this.memoryCache.clear();
    this.diskCache.clear();
    this.dependencyGraph.clear();
    
    // 清空磁盘缓存目录
    const fs = require('fs');
    const files = fs.readdirSync(this.config.CACHE_DIR);
    
    for (const file of files) {
      const filePath = join(this.config.CACHE_DIR, file);
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('删除缓存文件失败:', error);
      }
    }
  }

  /**
   * 添加文件依赖
   */
  addDependency(file, dependency) {
    if (this.config.DEPENDENCY_TRACKING.ENABLED) {
      this.dependencyGraph.addDependency(file, dependency);
    }
  }

  /**
   * 获取受影响的文件
   */
  getAffectedFiles(changedFile) {
    if (this.config.DEPENDENCY_TRACKING.ENABLED) {
      return this.dependencyGraph.getAffectedFiles(changedFile);
    }
    return new Set([changedFile]);
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      memoryCache: {
        size: this.memoryCache.size,
        maxSize: this.config.MEMORY_CACHE.MAX_SIZE
      },
      diskCache: {
        size: this.diskCache.size,
        totalSize: Array.from(this.diskCache.values())
          .reduce((sum, item) => sum + item.size, 0),
        maxSize: this.config.DISK_CACHE.MAX_SIZE
      },
      dependencies: {
        files: this.dependencyGraph.dependencies.size,
        relationships: Array.from(this.dependencyGraph.dependencies.values())
          .reduce((sum, deps) => sum + deps.size, 0)
      }
    };
  }
}

// 创建全局缓存实例
const globalCache = new SmartCache();

export {
  SmartCache,
  DependencyGraph,
  CACHE_CONFIG,
  globalCache
};

export default SmartCache;
