// 词法分析器和语法解析器

const acorn = require('acorn');

// 预编译正则表达式，提高性能
const REGEX_PATTERNS = {
  // 移除接口定义（包括多行）
  INTERFACE: /interface\s+\w+\s*\{[\s\S]*?\n\s*\}/g,
  // 移除类型别名（包括多行）
  TYPE_ALIAS: /type\s+\w+\s*=\s*[\s\S]*?\n\s*;/g,
  // 移除泛型参数：function identity<T>(value: T) -> function identity(value)
  GENERICS: /<[\w, ]+>/g,
  // 移除类型注解（合并多个模式）
  TYPE_ANNOTATION: /:\s*([\w|\s&]+)\s*(?=[=);,\{])/g,
  // 移除空行和多余的空格
  EMPTY_LINES: /\n\s*\n/g,
  // 移除行首行尾空格
  TRIM_LINES: /^\s+|\s+$/gm
};

/**
 * 预处理TypeScript Lite代码，移除类型注解
 * @param {string} code - TypeScript Lite代码
 * @returns {string} 移除类型注解后的代码
 */
function preprocess(code) {
  // 1. 移除接口定义
  code = code.replace(REGEX_PATTERNS.INTERFACE, '');
  
  // 2. 移除类型别名（更健壮的模式）
  code = code.replace(/type\s+\w+\s*=\s*([\w|\s&]+);/g, '');
  // 处理多行类型别名
  code = code.replace(/type\s+\w+\s*=\s*([\w|\s&]+)\s*\n/g, '');
  code = code.replace(/type\s+\w+\s*=\s*([\s\S]*?)\s*;/g, '');
  
  // 3. 移除泛型参数
  code = code.replace(REGEX_PATTERNS.GENERICS, '');
  
  // 4. 移除所有类型注解（合并多个模式，减少替换次数）
  code = code.replace(REGEX_PATTERNS.TYPE_ANNOTATION, '');
  
  // 5. 清理空白字符
  code = code.replace(REGEX_PATTERNS.EMPTY_LINES, '\n');
  code = code.replace(REGEX_PATTERNS.TRIM_LINES, '');
  
  // 6. 确保代码以换行结束
  code = code.trim() + '\n';
  
  return code;
}

/**
 * 解析TypeScript Lite代码生成AST
 * @param {string} code - TypeScript Lite代码
 * @param {object} options - 解析选项
 * @returns {object} 抽象语法树(AST)
 */
function parse(code, options = {}) {
  try {
    // 预处理代码，移除类型注解
    const processedCode = preprocess(code);
    
    // 解析处理后的代码
    const ast = acorn.parse(processedCode, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true
    });
    
    return ast;
  } catch (error) {
    // 增强错误信息
    error.loc = {
      line: error.loc?.line || 1,
      column: error.loc?.column || 0
    };
    throw error;
  }
}

/**
 * 检查代码是否包含TypeScript语法
 * @param {string} code - JavaScript代码
 * @returns {boolean} 是否包含TypeScript语法
 */
function hasTypeScriptSyntax(code) {
  // 简单检查是否包含类型注解
  return /:\s*\w+\s*=|function.*\(.*:\s*\w+/.test(code);
}

module.exports = {
  parse,
  hasTypeScriptSyntax
};