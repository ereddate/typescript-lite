// TypeScript Lite Webpack集成插件

const tsl = require('typescript-lite');

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
        this.emitError(new Error(`[TypeScript Lite] 类型错误: ${error.message} (行 ${error.line})`));
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

/**
 * Webpack插件
 */
class WebpackPlugin {
  constructor(options = {}) {
    this.options = options;
  }
  
  apply(compiler) {
    // 注册编译钩子
    compiler.hooks.compilation.tap('tsl-webpack-plugin', (compilation) => {
      // 注册模块处理钩子
      compilation.hooks.processAssets.tapAsync(
        {
          name: 'tsl-webpack-plugin',
          stage: compilation.PROCESS_ASSETS_STAGE_ANALYSE
        },
        (assets, callback) => {
          // 处理TypeScript Lite文件
          Object.keys(assets).forEach(assetName => {
            if (assetName.endsWith('.ts') || assetName.endsWith('.tsx')) {
              const source = assets[assetName].source();
              const compileResult = tsl.compile(source, this.options);
              
              if (compileResult.success) {
                assets[assetName] = {
                  source: () => compileResult.code,
                  size: () => compileResult.code.length
                };
              }
            }
          });
          
          callback();
        }
      );
    });
  }
}

module.exports = {
  webpackLoader,
  webpackPlugin: WebpackPlugin
};
