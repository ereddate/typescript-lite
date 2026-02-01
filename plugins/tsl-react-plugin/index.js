// TypeScript Lite React集成插件

const tsl = require('typescript-lite');

/**
 * React插件
 * @param {object} options - 插件选项
 * @returns {object} Vite插件配置
 */
function reactPlugin(options = {}) {
  return {
    name: 'tsl-react-plugin',
    
    // Vite插件钩子
    transform(code, id) {
      // 处理.tsx文件
      if (id.endsWith('.tsx')) {
        // 检查TypeScript Lite语法
        const checkResult = tsl.check(code, options);
        
        if (!checkResult.success) {
          // 输出错误信息
          checkResult.errors.forEach(error => {
            console.error(`[TypeScript Lite] React文件类型错误: ${error.message} (行 ${error.line})`);
          });
        }
        
        // 编译TypeScript Lite代码
        const compileResult = tsl.compile(code, options);
        
        if (compileResult.success) {
          return { code: compileResult.code, map: null };
        }
      }
      
      // 处理.ts文件
      if (id.endsWith('.ts')) {
        const compileResult = tsl.compile(code, options);
        if (compileResult.success) {
          return { code: compileResult.code, map: null };
        }
      }
      
      return null;
    }
  };
}

/**
 * Webpack Loader
 * @param {string} source - 源代码
 * @returns {string} 编译后的代码
 */
function webpackLoader(source) {
  const options = this.getOptions() || {};
  
  try {
    // 检查TypeScript Lite语法
    const checkResult = tsl.check(source, options);
    
    if (!checkResult.success) {
      // 输出错误信息
      checkResult.errors.forEach(error => {
        this.emitError(new Error(`[TypeScript Lite] React文件类型错误: ${error.message} (行 ${error.line})`));
      });
    }
    
    // 编译TypeScript Lite代码
    const compileResult = tsl.compile(source, options);
    
    if (compileResult.success) {
      return compileResult.code;
    }
    
    return source;
  } catch (error) {
    this.emitError(new Error(`[TypeScript Lite] 编译错误: ${error.message}`));
    return source;
  }
}

module.exports = {
  reactPlugin,
  webpackLoader
};
