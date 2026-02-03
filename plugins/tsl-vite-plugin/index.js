// TypeScript Lite Vite集成插件

import tsl from 'typescript-lite';

// 简单的预处理函数，移除TypeScript Lite语法
function preprocess(code) {
  // 1. 移除接口定义
  code = code.replace(/interface\s+\w+\s*\{[^{}]*\}/g, '');
  
  // 2. 移除类型别名
  code = code.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
  
  // 3. 移除泛型函数声明
  code = code.replace(/function\s+(\w+)<([^>]+)>\s*\(/g, 'function $1(');
  
  // 4. 移除函数返回值类型注解
  code = code.replace(/function\s+(\w+)\s*\(([^)]*)\)\s*:\s*([^\{]+)\s*\{/g, 'function $1($2) {');
  
  // 5. 移除变量声明中的类型注解
  code = code.replace(/(let|const|var)\s+(\w+)\s*:\s*([^=]+)\s*=/g, '$1 $2 =');
  
  // 6. 移除箭头函数参数中的类型注解
  code = code.replace(/const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/g, (match, funcName, params) => {
    // 移除参数中的类型注解
    let processedParams = params;
    processedParams = processedParams.replace(/(\w+)\s*:\s*([^,]+)/g, '$1');
    processedParams = processedParams.replace(/\{([^}]+)\}\s*:\s*([^,]+)/g, '{ $1 }');
    return `const ${funcName} = (${processedParams}) =>`;
  });
  
  // 7. 移除函数调用中的泛型参数
  code = code.replace(/(\w+)<([^>]+)>\s*\(/g, '$1(');
  
  // 8. 移除函数参数中的类型注解
  code = code.replace(/function\s+(\w+)\s*\(([^)]*)\)\s*\{/g, (match, funcName, params) => {
    // 移除参数中的类型注解
    let processedParams = params;
    processedParams = processedParams.replace(/(\w+)\s*:\s*([^,]+)/g, '$1');
    processedParams = processedParams.replace(/\{([^}]+)\}\s*:\s*([^,]+)/g, '{ $1 }');
    return `function ${funcName}(${processedParams}) {`;
  });
  
  // 9. 移除TypeScript类型断言语法
  code = code.replace(/as\s+unknown\s+as\s+[\w|\s&]+/g, '');
  code = code.replace(/as\s+[\w|\s&]+/g, '');
  
  // 10. 移除函数返回值类型注解（确保不会影响其他代码）
  code = code.replace(/:\s*void\s*\{/g, ' {');
  
  return code;
}

// 处理 .vue 文件
function processVueFile(code) {
  // 匹配所有 <script> 标签，包括 <script setup>
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
  let match;
  let processedCode = code;
  
  while ((match = scriptRegex.exec(code)) !== null) {
    const fullMatch = match[0];
    const scriptContent = match[1];
    const processedScriptContent = preprocess(scriptContent);
    const scriptTag = fullMatch.match(/<script([^>]*)>/)[0];
    processedCode = processedCode.replace(fullMatch, `${scriptTag}${processedScriptContent}</script>`);
  }
  
  return processedCode;
}

export function vitePlugin(options = {}) {
  return {
    name: 'tsl-vite-plugin',
    // 确保插件在其他插件之前执行
    enforce: 'pre',
    
    // Vite插件钩子
    transform(code, id) {
      // 处理所有TypeScript Lite文件
      if (id.endsWith('.ts') || id.endsWith('.tsx') || id.endsWith('.js') || id.endsWith('.jsx')) {
        // 检查TypeScript Lite语法
        const checkResult = tsl.check(code, options);
        
        if (!checkResult.success) {
          // 输出错误信息
          checkResult.errors.forEach(error => {
            console.error(`[TypeScript Lite] 类型错误: ${error.message} (行 ${error.line})`);
          });
        }
        
        // 预处理代码，移除类型注解
        const processedCode = preprocess(code);
        
        return { code: processedCode, map: null };
      } else if (id.endsWith('.vue')) {
        // 处理Vue文件
        const processedCode = processVueFile(code);
        return { code: processedCode, map: null };
      }
      
      return null;
    }
  };
}

