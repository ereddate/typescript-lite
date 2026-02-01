// TypeScript Lite Vue集成插件

const tsl = require('typescript-lite');

/**
 * Vue插件
 * @param {object} options - 插件选项
 * @returns {object} Vite插件配置
 */
function vuePlugin(options = {}) {
  return {
    name: 'tsl-vue-plugin',
    
    // Vite插件钩子
    transform(code, id) {
      // 处理.vue文件
      if (id.endsWith('.vue')) {
        // 提取<script>标签内容
        const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/);
        if (scriptMatch) {
          const scriptContent = scriptMatch[1];
          
          // 检查TypeScript Lite语法
          const checkResult = tsl.check(scriptContent, options);
          
          if (!checkResult.success) {
            // 输出错误信息
            checkResult.errors.forEach(error => {
              console.error(`[TypeScript Lite] Vue文件类型错误: ${error.message} (行 ${error.line})`);
            });
          }
          
          // 编译TypeScript Lite代码
          const compileResult = tsl.compile(scriptContent, options);
          
          if (compileResult.success) {
            // 替换<script>标签内容
            const newCode = code.replace(/<script[^>]*>([\s\S]*?)<\/script>/, `<script>${compileResult.code}</script>`);
            return { code: newCode };
          }
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
 * Vue CLI插件
 * @param {object} api - Vue CLI API
 * @param {object} options - 插件选项
 */
function vueCliPlugin(api, options = {}) {
  if (api) {
    api.chainWebpack(webpackConfig => {
      // 添加TypeScript Lite加载器
      webpackConfig.module
        .rule('tsl-vue')
        .test(/\.(vue|ts)$/)
        .use('tsl-vue-loader')
        .loader(require.resolve('./webpack-loader'))
        .options(options);
    });
  }
}

module.exports = {
  vuePlugin,
  vueCliPlugin
};
