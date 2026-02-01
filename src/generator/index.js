// 代码生成器模块

const estraverse = require('estraverse');
const escodegen = require('escodegen');

/**
 * 生成JavaScript代码，移除类型注解
 * @param {object} ast - 抽象语法树
 * @param {object} options - 生成选项
 * @returns {string} JavaScript代码
 */
function generate(ast, options = {}) {
  // 移除AST中的类型注解
  const cleanAst = removeTypeAnnotations(ast);
  
  // 生成JavaScript代码
  const code = escodegen.generate(cleanAst, {
    format: {
      indent: {
        style: '  ',
        base: 0
      },
      newline: '\n',
      space: ' ',
      quotes: 'double',
      compact: false,
      semicolons: true
    },
    sourceMap: options.sourceMap,
    sourceMapWithCode: options.sourceMapWithCode
  });
  
  return code;
}

/**
 * 移除AST中的类型注解
 * @param {object} ast - 抽象语法树
 * @returns {object} 移除类型注解后的AST
 */
function removeTypeAnnotations(ast) {
  return estraverse.replace(ast, {
    enter: function(node) {
      // 移除变量声明的类型注解
      if (node.type === 'VariableDeclarator' && node.id.typeAnnotation) {
        delete node.id.typeAnnotation;
      }
      
      // 移除函数参数的类型注解
      if (node.type === 'Identifier' && node.typeAnnotation) {
        delete node.typeAnnotation;
      }
      
      // 移除函数的返回值类型注解
      if ((node.type === 'FunctionDeclaration' || 
           node.type === 'FunctionExpression' || 
           node.type === 'ArrowFunctionExpression') && 
          node.returnType) {
        delete node.returnType;
      }
      
      // 移除TypeScript特有的节点
      if (node.type.startsWith('TS')) {
        return null;
      }
      
      return node;
    }
  });
}

module.exports = {
  generate,
  removeTypeAnnotations
};