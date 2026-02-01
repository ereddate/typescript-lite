// 错误报告系统

const chalk = require('chalk');

/**
 * 获取错误修复建议
 * @param {object} error - 错误对象
 * @returns {string} 修复建议
 */
function getFixSuggestion(error) {
  if (error.message.includes('类型错误')) {
    if (error.message.includes('期望类型')) {
      return '💡 建议：检查变量的赋值类型是否与声明类型匹配';
    }
    if (error.message.includes('函数参数')) {
      return '💡 建议：检查函数调用时的参数类型是否与函数声明匹配';
    }
  } else if (error.message.includes('语法错误')) {
    return '💡 建议：检查代码语法是否正确，特别是括号、分号等';
  }
  return '';
}

/**
 * 提取错误上下文
 * @param {string} code - 源代码
 * @param {number} line - 错误行号
 * @param {number} contextLines - 上下文行数
 * @returns {string} 错误上下文
 */
function getErrorContext(code, line, contextLines = 2) {
  if (!code) return '';
  
  const lines = code.split('\n');
  const startLine = Math.max(0, line - contextLines - 1);
  const endLine = Math.min(lines.length, line + contextLines);
  
  let context = '\n' + chalk.gray('上下文:') + '\n';
  
  for (let i = startLine; i < endLine; i++) {
    if (i === line - 1) {
      // 错误行
      context += chalk.red(`→ ${i + 1}: ${lines[i] || ''}\n`);
    } else {
      // 上下文行
      context += chalk.gray(`  ${i + 1}: ${lines[i] || ''}\n`);
    }
  }
  
  return context;
}

/**
 * 格式化错误信息
 * @param {array} errors - 错误列表
 * @param {string} filename - 文件名
 * @param {string} code - 源代码（可选）
 * @returns {string} 格式化的错误信息
 */
function formatErrors(errors, filename = 'unknown', code = '') {
  if (errors.length === 0) {
    return chalk.green('✅ 没有类型错误');
  }
  
  let output = `\n${chalk.red('❌ 类型错误 (')}${errors.length}${chalk.red('):')}\n\n`;
  
  errors.forEach((error, index) => {
    // 错误标题和严重性
    const severity = error.severity || 'error';
    const severityColor = severity === 'error' ? chalk.red : chalk.yellow;
    
    output += `${chalk.yellow(`错误 ${index + 1}:`)} ${error.message}\n`;
    output += `${chalk.gray(`位置: ${filename}:${error.line}:${error.column}`)}\n`;
    
    // 显示错误代码
    if (error.code) {
      output += `${chalk.magenta(`错误代码: ${error.code}`)}\n`;
    }
    
    // 添加错误上下文
    if ((code || error.code) && error.line > 0) {
      const contextCode = error.code || code;
      output += getErrorContext(contextCode, error.line);
    }
    
    // 添加修复建议
    if (error.fix) {
      output += `${chalk.cyan(`💡 修复建议: ${error.fix.message}`)}\n`;
      if (error.fix.example) {
        output += `${chalk.green(`示例: ${error.fix.example}`)}\n`;
      }
    } else {
      const suggestion = getFixSuggestion(error);
      if (suggestion) {
        output += `${chalk.cyan(suggestion)}\n`;
      }
    }
    
    output += '\n';
  });
  
  return output;
}

/**
 * 打印错误信息到控制台
 * @param {array} errors - 错误列表
 * @param {string} filename - 文件名
 * @param {string} code - 源代码（可选）
 */
function reportErrors(errors, filename = 'unknown', code = '') {
  const formattedErrors = formatErrors(errors, filename, code);
  console.log(formattedErrors);
}

/**
 * 生成错误摘要
 * @param {array} errors - 错误列表
 * @returns {object} 错误摘要
 */
function getErrorSummary(errors) {
  return {
    total: errors.length,
    types: getErrorTypes(errors)
  };
}

/**
 * 统计错误类型
 * @param {array} errors - 错误列表
 * @returns {object} 错误类型统计
 */
function getErrorTypes(errors) {
  const types = {};
  
  errors.forEach(error => {
    if (error.message.includes('类型错误')) {
      types.typeError = (types.typeError || 0) + 1;
    } else if (error.message.includes('语法错误')) {
      types.syntaxError = (types.syntaxError || 0) + 1;
    } else {
      types.otherError = (types.otherError || 0) + 1;
    }
  });
  
  return types;
}

module.exports = {
  formatErrors,
  reportErrors,
  getErrorSummary,
  getErrorTypes
};