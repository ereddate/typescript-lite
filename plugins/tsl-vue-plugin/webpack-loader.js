// TypeScript Lite Vue Webpack Loader

const tsl = require('typescript-lite');

/**
 * TypeScript Lite Vue Webpack Loader
 * @param {string} source - 源代码
 * @returns {string} 编译后的代码
 */
function tslVueLoader(source) {
  const options = this.getOptions() || {};
  
  try {
    // 处理.vue文件
    if (this.resourcePath.endsWith('.vue')) {
      // 提取<script>标签内容
      const scriptMatch = source.match(/<script[^>]*>([\s\S]*?)<\/script>/);
      if (scriptMatch) {
        const scriptContent = scriptMatch[1];
        
        // 检查TypeScript Lite语法
        const checkResult = tsl.check(scriptContent, options);
        
        if (!checkResult.success) {
          // 输出错误信息
          checkResult.errors.forEach(error => {
            this.emitError(new Error(`[TypeScript Lite] Vue文件类型错误: ${error.message} (行 ${error.line})`));
          });
        }
        
        // 编译TypeScript Lite代码
        const compileResult = tsl.compile(scriptContent, options);
        
        if (compileResult.success) {
          // 替换<script>标签内容
          return source.replace(/<script[^>]*>([\s\S]*?)<\/script>/, `<script>${compileResult.code}</script>`);
        }
      }
    }
    
    // 处理.ts文件
    if (this.resourcePath.endsWith('.ts')) {
      const compileResult = tsl.compile(source, options);
      if (compileResult.success) {
        return compileResult.code;
      }
    }
    
    return source;
  } catch (error) {
    this.emitError(new Error(`[TypeScript Lite] 编译错误: ${error.message}`));
    return source;
  }
}

module.exports = tslVueLoader;
