// TypeScript Lite Vite集成插件

const tsl = require('typescript-lite');

/**
 * Vite插件
 * @param {object} options - 插件选项
 * @returns {object} Vite插件配置
 */
function vitePlugin(options = {}) {
  return {
    name: 'tsl-vite-plugin',
    
    // Vite插件钩子
    transform(code, id) {
      // 处理TypeScript Lite文件
      if (id.endsWith('.ts') || id.endsWith('.tsx')) {
        // 检查TypeScript Lite语法
        const checkResult = tsl.check(code, options);
        
        if (!checkResult.success) {
          // 输出错误信息
          checkResult.errors.forEach(error => {
            console.error(`[TypeScript Lite] 类型错误: ${error.message} (行 ${error.line})`);
          });
        }
        
        // 编译TypeScript Lite代码
        const compileResult = tsl.compile(code, options);
        
        if (compileResult.success) {
          return { code: compileResult.code, map: null };
        }
      }
      
      return null;
    }
  };
}

module.exports = {
  vitePlugin
};
