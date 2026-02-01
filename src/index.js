// TypeScript Lite 主入口文件

const parser = require('./parser');
const checker = require('./checker');
const generator = require('./generator');
const reporter = require('./reporter');
const config = require('./config');

// 缓存配置
const CACHE_CONFIG = {
  MAX_COMPILE_CACHE: 1000,  // 最大编译缓存项数
  MAX_CHECK_CACHE: 2000,    // 最大检查缓存项数
  MAX_FILE_CACHE: 500,      // 最大文件缓存项数
  CLEANUP_THRESHOLD: 0.8    // 清理阈值，当达到此比例时开始清理
};

// 缓存机制（带LRU淘汰策略）
const cache = {
  compile: {
    data: new Map(),
    keys: [], // LRU顺序，最近使用的在前面
    maxSize: CACHE_CONFIG.MAX_COMPILE_CACHE
  },
  check: {
    data: new Map(),
    keys: [],
    maxSize: CACHE_CONFIG.MAX_CHECK_CACHE
  },
  files: {
    data: new Map(),
    keys: [],
    maxSize: CACHE_CONFIG.MAX_FILE_CACHE
  }
};

// LRU缓存操作
function getCacheItem(cache, key) {
  if (cache.data.has(key)) {
    // 更新LRU顺序
    const index = cache.keys.indexOf(key);
    if (index > -1) {
      cache.keys.splice(index, 1);
    }
    cache.keys.unshift(key); // 移到最前面
    return cache.data.get(key);
  }
  return undefined;
}

function setCacheItem(cache, key, value) {
  // 检查缓存大小
  if (cache.keys.length >= cache.maxSize * CACHE_CONFIG.CLEANUP_THRESHOLD) {
    // 清理最久未使用的项
    const itemsToRemove = Math.floor(cache.keys.length * (1 - CACHE_CONFIG.CLEANUP_THRESHOLD));
    for (let i = 0; i < itemsToRemove; i++) {
      const oldKey = cache.keys.pop();
      cache.data.delete(oldKey);
    }
  }
  
  // 更新缓存
  cache.data.set(key, value);
  
  // 更新LRU顺序
  const index = cache.keys.indexOf(key);
  if (index > -1) {
    cache.keys.splice(index, 1);
  }
  cache.keys.unshift(key); // 移到最前面
}

function hasCacheItem(cache, key) {
  return cache.data.has(key);
}

// 简单的哈希函数
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash).toString(16);
}

// 生成缓存键
function generateCacheKey(code, options) {
  const optionString = JSON.stringify(options);
  // 使用代码长度、代码哈希和选项哈希生成缓存键
  const codeHash = simpleHash(code);
  const optionHash = simpleHash(optionString);
  return `${code.length}|${codeHash}|${optionHash}`;
}

// 生成文件缓存键
function generateFileCacheKey(filePath, options) {
  const optionString = JSON.stringify(options);
  // 使用文件路径哈希和选项哈希生成缓存键
  const pathHash = simpleHash(filePath);
  const optionHash = simpleHash(optionString);
  return `${pathHash}|${optionHash}`;
}

// 文件状态缓存
const fileStatusCache = new Map();
const FILE_STATUS_CACHE_TTL = 5000; // 缓存有效期（毫秒）

// 获取文件状态（带缓存）
function getFileStatus(filePath) {
  try {
    // 检查缓存
    const cachedStatus = fileStatusCache.get(filePath);
    if (cachedStatus && Date.now() - cachedStatus.timestamp < FILE_STATUS_CACHE_TTL) {
      return cachedStatus.status;
    }
    
    // 读取文件状态
    const fs = require('fs');
    const stats = fs.statSync(filePath);
    const status = {
      mtime: stats.mtime.getTime(),
      size: stats.size
    };
    
    // 更新缓存
    fileStatusCache.set(filePath, {
      status: status,
      timestamp: Date.now()
    });
    
    return status;
  } catch (error) {
    return null;
  }
}

// 检查文件是否变更
function hasFileChanged(filePath, cachedStatus) {
  const currentStatus = getFileStatus(filePath);
  if (!currentStatus || !cachedStatus) {
    return true;
  }
  return currentStatus.mtime !== cachedStatus.mtime || currentStatus.size !== cachedStatus.size;
}

/**
 * 编译TypeScript Lite代码
 * @param {string} code - TypeScript Lite代码
 * @param {object} options - 编译选项
 * @returns {object} 编译结果
 */
function compile(code, options = {}) {
  try {
    // 生成缓存键
    const cacheKey = generateCacheKey(code, options);
    
    // 检查缓存
    const cachedResult = getCacheItem(cache.compile, cacheKey);
    if (cachedResult !== undefined) {
      return cachedResult;
    }
    
    // 解析配置
    const compileOptions = config.merge(options);
    
    // 解析代码生成AST
    const ast = parser.parse(code, compileOptions);
    
    // 类型检查
    const errors = checker.check(ast, compileOptions, code);
    
    let result;
    // 如果有错误，返回错误信息
    if (errors.length > 0) {
      result = {
        success: false,
        errors: errors
      };
    } else {
      // 生成JavaScript代码
      const jsCode = generator.generate(ast, compileOptions);
      
      result = {
        success: true,
        code: jsCode,
        errors: []
      };
    }
    
    // 缓存结果
    setCacheItem(cache.compile, cacheKey, result);
    
    return result;
  } catch (error) {
    return {
      success: false,
      errors: [{
        message: error.message,
        line: error.loc?.line || 0,
        column: error.loc?.column || 0,
        code: code // 保存源代码用于错误上下文
      }]
    };
  }
}

/**
 * 检查TypeScript Lite代码的类型
 * @param {string} code - TypeScript Lite代码
 * @param {object} options - 检查选项
 * @returns {object} 检查结果
 */
function check(code, options = {}) {
  try {
    // 生成缓存键
    const cacheKey = generateCacheKey(code, options);
    
    // 检查缓存
    const cachedResult = getCacheItem(cache.check, cacheKey);
    if (cachedResult !== undefined) {
      return cachedResult;
    }
    
    // 解析配置
    const checkOptions = config.merge(options);
    
    // 解析代码生成AST
    const ast = parser.parse(code, checkOptions);
    
    // 类型检查
    const errors = checker.check(ast, checkOptions, code);
    
    const result = {
      success: errors.length === 0,
      errors: errors
    };
    
    // 缓存结果
    setCacheItem(cache.check, cacheKey, result);
    
    return result;
  } catch (error) {
    return {
      success: false,
      errors: [{
        message: error.message,
        line: error.loc?.line || 0,
        column: error.loc?.column || 0,
        code: code // 保存源代码用于错误上下文
      }]
    };
  }
}

/**
 * 编译文件
 * @param {string} filePath - 文件路径
 * @param {object} options - 编译选项
 * @returns {object} 编译结果
 */
function compileFile(filePath, options = {}) {
  try {
    const fs = require('fs');
    const code = fs.readFileSync(filePath, 'utf8');
    
    // 检查文件是否变更
    const fileCacheKey = generateFileCacheKey(filePath, options);
    const cachedFile = getCacheItem(cache.files, fileCacheKey);
    
    if (!hasFileChanged(filePath, cachedFile?.status)) {
      console.log(`✅ 文件 ${filePath} 未变更，使用缓存结果`);
      return cachedFile.result;
    }
    
    // 编译文件
    const result = compile(code, options);
    
    // 更新文件缓存
    setCacheItem(cache.files, fileCacheKey, {
      status: getFileStatus(filePath),
      result: result
    });
    
    console.log(`🔄 编译文件 ${filePath}`);
    return result;
  } catch (error) {
    return {
      success: false,
      errors: [{
        message: error.message,
        line: 0,
        column: 0
      }]
    };
  }
}

/**
 * 检查文件类型
 * @param {string} filePath - 文件路径
 * @param {object} options - 检查选项
 * @returns {object} 检查结果
 */
function checkFile(filePath, options = {}) {
  try {
    const fs = require('fs');
    const code = fs.readFileSync(filePath, 'utf8');
    
    // 检查文件是否变更
    const fileCacheKey = generateFileCacheKey(filePath, options);
    const cachedFile = getCacheItem(cache.files, fileCacheKey);
    
    if (!hasFileChanged(filePath, cachedFile?.status)) {
      console.log(`✅ 文件 ${filePath} 未变更，使用缓存结果`);
      return cachedFile.result;
    }
    
    // 检查文件
    const result = check(code, options);
    
    // 更新文件缓存
    setCacheItem(cache.files, fileCacheKey, {
      status: getFileStatus(filePath),
      result: result
    });
    
    console.log(`🔄 检查文件 ${filePath}`);
    return result;
  } catch (error) {
    return {
      success: false,
      errors: [{
        message: error.message,
        line: 0,
        column: 0
      }]
    };
  }
}

/**
 * 清空缓存
 * @returns {void}
 */
function clearCache() {
  cache.compile.data.clear();
  cache.compile.keys = [];
  cache.check.data.clear();
  cache.check.keys = [];
  cache.files.data.clear();
  cache.files.keys = [];
  console.log('TypeScript Lite 缓存已清空');
}

module.exports = {
  compile,
  check,
  compileFile,
  checkFile,
  clearCache,
  parser,
  checker,
  generator,
  reporter,
  config
};