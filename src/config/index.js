// 配置管理模块

// 默认配置
const defaultConfig = {
  // 目标JavaScript版本
  target: 'ES2020',
  // 是否启用严格模式
  strict: false,
  // 是否生成编译产物
  noEmit: false,
  // 检查的文件范围
  include: ['**/*.ts'],
  // 排除的文件范围
  exclude: ['node_modules', 'dist']
};

/**
 * 合并用户配置和默认配置
 * @param {object} userConfig - 用户配置
 * @returns {object} 合并后的配置
 */
function merge(userConfig = {}) {
  return {
    ...defaultConfig,
    ...userConfig
  };
}

/**
 * 加载配置文件
 * @param {string} configPath - 配置文件路径
 * @returns {object} 配置对象
 */
function load(configPath) {
  try {
    const fs = require('fs');
    const path = require('path');
    
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configContent);
    }
    
    return {};
  } catch (error) {
    console.error('加载配置文件失败:', error.message);
    return {};
  }
}

module.exports = {
  defaultConfig,
  merge,
  load
};