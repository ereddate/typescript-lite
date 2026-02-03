import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import SmartCache from '../src/smart-cache/index.js';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

describe('智能缓存测试', () => {
  let cache;
  
  before(async () => {
    cache = new SmartCache({
      CACHE_DIR: join(__dirname, '.test-cache'),
      MEMORY_CACHE: {
        MAX_SIZE: 10,
        TTL: 1000,
        CLEANUP_THRESHOLD: 0.8
      },
      DISK_CACHE: {
        MAX_SIZE: 1024 * 1024, // 1MB
        TTL: 2000
      }
    });
    await cache.initialize();
  });
  
  after(async () => {
    await cache.clear();
  });
  
  describe('内存缓存', () => {
    it('应该能够存储和获取缓存', async () => {
      const key = 'test-key-1';
      const value = { data: 'test-value' };
      
      await cache.set(key, value);
      const result = await cache.get(key);
      
      expect(result).to.deep.equal(value);
    });
    
    it('应该能够处理缓存未命中', async () => {
      const result = await cache.get('non-existent-key');
      
      expect(result).to.be.null;
    });
    
    it('应该能够删除缓存', async () => {
      const key = 'test-key-2';
      const value = { data: 'test-value' };
      
      await cache.set(key, value);
      await cache.delete(key);
      
      const result = await cache.get(key);
      expect(result).to.be.null;
    });
    
    it('应该能够处理缓存过期', async () => {
      const key = 'test-key-3';
      const value = { data: 'test-value' };
      
      await cache.set(key, value);
      
      // 等待缓存过期
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const result = await cache.get(key);
      expect(result).to.be.null;
    });
    
    it('应该能够自动清理过期的缓存', async () => {
      const keys = [];
      for (let i = 0; i < 15; i++) {
        const key = `test-key-${i}`;
        const value = { data: `test-value-${i}` };
        await cache.set(key, value);
        keys.push(key);
      }
      
      // 等待一些缓存过期
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // 检查缓存是否被清理
      const stats = cache.getStats();
      expect(stats.memoryCache.size).to.be.below(15);
    });
  });
  
  describe('磁盘缓存', () => {
    it('应该能够将缓存写入磁盘', async () => {
      const key = 'test-disk-key-1';
      const value = { data: 'test-disk-value' };
      
      await cache.set(key, value);
      
      const result = await cache.get(key);
      expect(result).to.deep.equal(value);
    });
    
    it('应该能够从磁盘读取缓存', async () => {
      const key = 'test-disk-key-2';
      const value = { data: 'test-disk-value-2' };
      
      await cache.set(key, value);
      
      // 清空内存缓存
      cache.memoryCache.clear();
      
      const result = await cache.get(key);
      expect(result).to.deep.equal(value);
    });
    
    it('应该能够处理磁盘缓存过期', async () => {
      const key = 'test-disk-key-3';
      const value = { data: 'test-disk-value-3' };
      
      await cache.set(key, value);
      
      // 等待磁盘缓存过期
      await new Promise(resolve => setTimeout(resolve, 2100));
      
      const result = await cache.get(key);
      expect(result).to.be.null;
    });
  });
  
  describe('依赖跟踪', () => {
    it('应该能够添加文件依赖', () => {
      const file = 'file-a.ts';
      const dependency = 'file-b.ts';
      
      cache.addDependency(file, dependency);
      
      const dependents = cache.dependencyGraph.getDependents(dependency);
      expect(dependents).to.include(file);
    });
    
    it('应该能够获取文件的依赖', () => {
      const file = 'file-c.ts';
      const dependency = 'file-d.ts';
      
      cache.addDependency(file, dependency);
      
      const dependencies = cache.dependencyGraph.getDependencies(file);
      expect(dependencies).to.include(dependency);
    });
    
    it('应该能够获取受影响的文件', () => {
      const fileA = 'file-e.ts';
      const fileB = 'file-f.ts';
      const fileC = 'file-g.ts';
      
      cache.addDependency(fileB, fileA);
      cache.addDependency(fileC, fileB);
      
      const affected = cache.dependencyGraph.getAffectedFiles(fileA);
      
      expect(affected).to.include(fileB);
      expect(affected).to.include(fileC);
    });
    
    it('应该能够移除文件依赖', () => {
      const file = 'file-h.ts';
      const dependency = 'file-i.ts';
      
      cache.addDependency(file, dependency);
      cache.dependencyGraph.removeFile(file);
      
      const dependents = cache.dependencyGraph.getDependents(dependency);
      expect(dependents).to.not.include(file);
    });
  });
  
  describe('缓存统计', () => {
    it('应该能够获取缓存统计信息', async () => {
      const stats = cache.getStats();
      
      expect(stats).to.have.property('memoryCache');
      expect(stats).to.have.property('diskCache');
      expect(stats).to.have.property('dependencies');
      
      expect(stats.memoryCache).to.have.property('size');
      expect(stats.memoryCache).to.have.property('maxSize');
      
      expect(stats.diskCache).to.have.property('size');
      expect(stats.diskCache).to.have.property('totalSize');
      expect(stats.diskCache).to.have.property('maxSize');
      
      expect(stats.dependencies).to.have.property('files');
      expect(stats.dependencies).to.have.property('relationships');
    });
    
    it('应该能够正确统计缓存项', async () => {
      const initialStats = cache.getStats();
      
      for (let i = 0; i < 5; i++) {
        const key = `stats-key-${i}`;
        const value = { data: `stats-value-${i}` };
        await cache.set(key, value);
      }
      
      const finalStats = cache.getStats();
      
      expect(finalStats.memoryCache.size).to.be.at.least(initialStats.memoryCache.size + 5);
    });
  });
  
  describe('缓存键生成', () => {
    it('应该能够生成唯一的缓存键', () => {
      const code1 = 'let x: string = "hello";';
      const code2 = 'let y: number = 42;';
      const options = { strict: true };
      
      const key1 = cache.generateKey(code1, options);
      const key2 = cache.generateKey(code2, options);
      
      expect(key1).to.not.equal(key2);
    });
    
    it('应该能够为相同代码生成相同的缓存键', () => {
      const code = 'let x: string = "hello";';
      const options = { strict: true };
      
      const key1 = cache.generateKey(code, options);
      const key2 = cache.generateKey(code, options);
      
      expect(key1).to.equal(key2);
    });
    
    it('应该能够为不同选项生成不同的缓存键', () => {
      const code = 'let x: string = "hello";';
      const options1 = { strict: true };
      const options2 = { strict: false };
      
      const key1 = cache.generateKey(code, options1);
      const key2 = cache.generateKey(code, options2);
      
      expect(key1).to.not.equal(key2);
    });
  });
  
  describe('缓存清理', () => {
    it('应该能够清空所有缓存', async () => {
      for (let i = 0; i < 10; i++) {
        const key = `clear-key-${i}`;
        const value = { data: `clear-value-${i}` };
        await cache.set(key, value);
      }
      
      await cache.clear();
      
      const stats = cache.getStats();
      expect(stats.memoryCache.size).to.equal(0);
      expect(stats.diskCache.size).to.equal(0);
      expect(stats.dependencies.files).to.equal(0);
    });
  });
});
