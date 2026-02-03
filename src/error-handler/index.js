/**
 * 增强的错误处理模块
 * 提供详细的错误信息、错误上下文和修复建议
 */

/**
 * 错误代码定义
 */
const ERROR_CODES = {
  // 类型错误
  TYPE_MISMATCH: 'TS-001',
  TYPE_NOT_FOUND: 'TS-002',
  TYPE_INCOMPATIBLE: 'TS-003',
  
  // 函数错误
  FUNCTION_ARG_TYPE_MISMATCH: 'TS-101',
  FUNCTION_RETURN_TYPE_MISMATCH: 'TS-102',
  FUNCTION_NOT_FOUND: 'TS-103',
  
  // 变量错误
  VARIABLE_NOT_DECLARED: 'TS-201',
  VARIABLE_REDECLARED: 'TS-202',
  VARIABLE_TYPE_MISMATCH: 'TS-203',
  
  // 接口错误
  INTERFACE_NOT_FOUND: 'TS-301',
  INTERFACE_PROPERTY_NOT_FOUND: 'TS-302',
  INTERFACE_PROPERTY_TYPE_MISMATCH: 'TS-303',
  
  // 泛型错误
  GENERIC_TYPE_NOT_FOUND: 'TS-401',
  GENERIC_CONSTRAINT_VIOLATION: 'TS-402',
  
  // 语法错误
  SYNTAX_ERROR: 'TS-501',
  UNEXPECTED_TOKEN: 'TS-502',
  MISSING_SEMICOLON: 'TS-503'
};

/**
 * 错误严重级别
 */
const ERROR_SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  HINT: 'hint'
};

/**
 * 错误修复建议模板
 */
const FIX_TEMPLATES = {
  [ERROR_CODES.TYPE_MISMATCH]: {
    message: '类型不匹配',
    suggestions: [
      '检查变量声明的类型是否正确',
      '确认赋值的类型与声明的类型一致',
      '考虑使用类型转换或类型断言'
    ],
    examples: (expected, actual) => [
      `// 正确示例`,
      `let value: ${expected} = ${getDefaultValue(expected)};`,
      ``,
      `// 错误示例`,
      `let value: ${expected} = ${getDefaultValue(actual)}; // 类型错误`
    ]
  },
  
  [ERROR_CODES.FUNCTION_ARG_TYPE_MISMATCH]: {
    message: '函数参数类型不匹配',
    suggestions: [
      '检查函数调用的参数类型',
      '确认函数定义的参数类型',
      '考虑使用类型转换或修改参数类型'
    ],
    examples: (funcName, paramName, expectedType, actualType) => [
      `// 正确示例`,
      `${funcName}(${paramName}: ${expectedType})`,
      ``,
      `// 错误示例`,
      `${funcName}(${paramName}: ${actualType}) // 类型错误`
    ]
  },
  
  [ERROR_CODES.FUNCTION_RETURN_TYPE_MISMATCH]: {
    message: '函数返回值类型不匹配',
    suggestions: [
      '检查函数的返回值类型',
      '确认函数返回的值类型',
      '考虑修改返回值类型或返回值'
    ],
    examples: (funcName, expectedType, actualType) => [
      `// 正确示例`,
      `function ${funcName}(): ${expectedType} {`,
      `  return ${getDefaultValue(expectedType)};`,
      `}`,
      ``,
      `// 错误示例`,
      `function ${funcName}(): ${expectedType} {`,
      `  return ${getDefaultValue(actualType)}; // 类型错误`,
      `}`
    ]
  },
  
  [ERROR_CODES.INTERFACE_PROPERTY_NOT_FOUND]: {
    message: '接口属性不存在',
    suggestions: [
      '检查接口定义中是否包含该属性',
      '确认属性名称拼写正确',
      '考虑添加缺失的属性到接口定义中'
    ],
    examples: (interfaceName, propertyName) => [
      `// 正确示例`,
      `interface ${interfaceName} {`,
      `  ${propertyName}: string;`,
      `}`,
      ``,
      `// 错误示例`,
      `interface ${interfaceName} {`,
      `  // 缺少 ${propertyName} 属性`,
      `}`
    ]
  },
  
  [ERROR_CODES.VARIABLE_NOT_DECLARED]: {
    message: '变量未声明',
    suggestions: [
      '检查变量是否已声明',
      '确认变量名称拼写正确',
      '考虑在作用域内声明该变量'
    ],
    examples: (varName) => [
      `// 正确示例`,
      `let ${varName}: string = 'hello';`,
      `console.log(${varName});`,
      ``,
      `// 错误示例`,
      `console.log(${varName}); // 变量未声明`
    ]
  },
  
  [ERROR_CODES.SYNTAX_ERROR]: {
    message: '语法错误',
    suggestions: [
      '检查代码语法是否正确',
      '确认所有括号、引号都正确闭合',
      '检查是否有拼写错误或遗漏的符号'
    ],
    examples: (code) => [
      `// 正确示例`,
      `const value: string = 'hello';`,
      ``,
      `// 错误示例`,
      `${code} // 语法错误`
    ]
  }
};

/**
 * 获取默认值
 */
function getDefaultValue(type) {
  const typeMap = {
    string: "''",
    number: '0',
    boolean: 'false',
    object: '{}',
    array: '[]',
    function: '() => {}',
    any: 'undefined',
    null: 'null',
    undefined: 'undefined'
  };
  return typeMap[type] || 'undefined';
}

/**
 * 增强的错误类
 */
class EnhancedError {
  constructor(options = {}) {
    this.code = options.code || ERROR_CODES.TYPE_MISMATCH;
    this.message = options.message || '未知错误';
    this.severity = options.severity || ERROR_SEVERITY.ERROR;
    this.line = options.line || 0;
    this.column = options.column || 0;
    this.source = options.source || '';
    this.context = options.context || '';
    this.relatedErrors = options.relatedErrors || [];
    this.fixes = options.fixes || [];
    this.documentationUrl = options.documentationUrl || '';
  }

  /**
   * 生成错误报告
   */
  generateReport() {
    return {
      code: this.code,
      message: this.message,
      severity: this.severity,
      location: {
        line: this.line,
        column: this.column
      },
      context: this.context,
      suggestions: this.generateSuggestions(),
      examples: this.generateExamples(),
      relatedErrors: this.relatedErrors,
      documentationUrl: this.documentationUrl
    };
  }

  /**
   * 生成修复建议
   */
  generateSuggestions() {
    const template = FIX_TEMPLATES[this.code];
    if (!template) return [];
    
    return template.suggestions || [];
  }

  /**
   * 生成示例代码
   */
  generateExamples() {
    const template = FIX_TEMPLATES[this.code];
    if (!template || !template.examples) return [];
    
    return template.examples(...this.getExampleParams());
  }

  /**
   * 获取示例参数
   */
  getExampleParams() {
    return [];
  }

  /**
   * 生成错误上下文
   */
  generateContext(source, line, column, contextLines = 2) {
    const lines = source.split('\n');
    const startLine = Math.max(0, line - contextLines - 1);
    const endLine = Math.min(lines.length, line + contextLines);
    
    const contextLinesArray = [];
    for (let i = startLine; i < endLine; i++) {
      const isErrorLine = i === line - 1;
      const prefix = isErrorLine ? '> ' : '  ';
      const lineContent = lines[i] || '';
      const pointer = isErrorLine ? ' '.repeat(column) + '^' : '';
      
      contextLinesArray.push({
        lineNumber: i + 1,
        content: lineContent,
        isError: isErrorLine,
        pointer: pointer
      });
    }
    
    return contextLinesArray;
  }
}

/**
 * 错误处理器
 */
class ErrorHandler {
  constructor(options = {}) {
    this.errors = [];
    this.warnings = [];
    this.options = {
      maxErrors: 100,
      maxWarnings: 100,
      ...options
    };
  }

  /**
   * 添加错误
   */
  addError(error) {
    if (this.errors.length >= this.options.maxErrors) return;
    
    const enhancedError = error instanceof EnhancedError 
      ? error 
      : new EnhancedError(error);
    
    this.errors.push(enhancedError);
  }

  /**
   * 添加警告
   */
  addWarning(warning) {
    if (this.warnings.length >= this.options.maxWarnings) return;
    
    const enhancedWarning = warning instanceof EnhancedError
      ? { ...warning, severity: ERROR_SEVERITY.WARNING }
      : new EnhancedError({ ...warning, severity: ERROR_SEVERITY.WARNING });
    
    this.warnings.push(enhancedWarning);
  }

  /**
   * 添加错误上下文
   */
  addContextToErrors(source) {
    this.errors.forEach(error => {
      error.context = error.generateContext(source, error.line, error.column);
    });
    
    this.warnings.forEach(warning => {
      warning.context = warning.generateContext(source, warning.line, warning.column);
    });
  }

  /**
   * 生成错误报告
   */
  generateReport() {
    return {
      errors: this.errors.map(error => error.generateReport()),
      warnings: this.warnings.map(warning => warning.generateReport()),
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        hasErrors: this.errors.length > 0,
        hasWarnings: this.warnings.length > 0
      }
    };
  }

  /**
   * 格式化错误报告
   */
  formatReport(format = 'text') {
    const report = this.generateReport();
    
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      case 'html':
        return this.formatHtmlReport(report);
      case 'text':
      default:
        return this.formatTextReport(report);
    }
  }

  /**
   * 格式化文本报告
   */
  formatTextReport(report) {
    let output = '';
    
    if (report.summary.hasErrors) {
      output += `❌ 发现 ${report.summary.totalErrors} 个错误\n\n`;
      
      report.errors.forEach((error, index) => {
        output += `错误 ${index + 1}: ${error.code}\n`;
        output += `  位置: 第 ${error.location.line} 行，第 ${error.location.column} 列\n`;
        output += `  消息: ${error.message}\n`;
        
        if (error.suggestions.length > 0) {
          output += `  建议:\n`;
          error.suggestions.forEach((suggestion, i) => {
            output += `    ${i + 1}. ${suggestion}\n`;
          });
        }
        
        if (error.examples.length > 0) {
          output += `  示例:\n`;
          error.examples.forEach(example => {
            output += `    ${example}\n`;
          });
        }
        
        output += '\n';
      });
    }
    
    if (report.summary.hasWarnings) {
      output += `⚠️  发现 ${report.summary.totalWarnings} 个警告\n\n`;
      
      report.warnings.forEach((warning, index) => {
        output += `警告 ${index + 1}: ${warning.code}\n`;
        output += `  位置: 第 ${warning.location.line} 行，第 ${warning.location.column} 列\n`;
        output += `  消息: ${warning.message}\n\n`;
      });
    }
    
    if (!report.summary.hasErrors && !report.summary.hasWarnings) {
      output += '✅ 没有发现错误或警告\n';
    }
    
    return output;
  }

  /**
   * 格式化 HTML 报告
   */
  formatHtmlReport(report) {
    let html = '<!DOCTYPE html>\n<html>\n<head>\n';
    html += '<meta charset="UTF-8">\n';
    html += '<title>TypeScript Lite 错误报告</title>\n';
    html += '<style>\n';
    html += 'body { font-family: Arial, sans-serif; margin: 20px; }\n';
    html += '.error { background: #fee; border-left: 4px solid #f00; padding: 10px; margin: 10px 0; }\n';
    html += '.warning { background: #ffc; border-left: 4px solid #fa0; padding: 10px; margin: 10px 0; }\n';
    html += '.code { font-family: monospace; background: #f5f5f5; padding: 5px; }\n';
    html += '.suggestions { margin: 10px 0; }\n';
    html += '.example { background: #f9f9f9; padding: 10px; margin: 5px 0; }\n';
    html += '</style>\n</head>\n<body>\n';
    
    if (report.summary.hasErrors) {
      html += `<h1>❌ 发现 ${report.summary.totalErrors} 个错误</h1>\n`;
      
      report.errors.forEach((error, index) => {
        html += `<div class="error">\n`;
        html += `<h2>错误 ${index + 1}: ${error.code}</h2>\n`;
        html += `<p><strong>位置:</strong> 第 ${error.location.line} 行，第 ${error.location.column} 列</p>\n`;
        html += `<p><strong>消息:</strong> ${error.message}</p>\n`;
        
        if (error.suggestions.length > 0) {
          html += '<div class="suggestions">\n';
          html += '<h3>建议:</h3>\n';
          html += '<ul>\n';
          error.suggestions.forEach(suggestion => {
            html += `<li>${suggestion}</li>\n`;
          });
          html += '</ul>\n</div>\n';
        }
        
        if (error.examples.length > 0) {
          html += '<div class="examples">\n';
          html += '<h3>示例:</h3>\n';
          error.examples.forEach(example => {
            html += `<pre class="example">${example}</pre>\n`;
          });
          html += '</div>\n';
        }
        
        html += '</div>\n';
      });
    }
    
    if (report.summary.hasWarnings) {
      html += `<h1>⚠️  发现 ${report.summary.totalWarnings} 个警告</h1>\n`;
      
      report.warnings.forEach((warning, index) => {
        html += `<div class="warning">\n`;
        html += `<h2>警告 ${index + 1}: ${warning.code}</h2>\n`;
        html += `<p><strong>位置:</strong> 第 ${warning.location.line} 行，第 ${warning.location.column} 列</p>\n`;
        html += `<p><strong>消息:</strong> ${warning.message}</p>\n`;
        html += '</div>\n';
      });
    }
    
    if (!report.summary.hasErrors && !report.summary.hasWarnings) {
      html += '<h1>✅ 没有发现错误或警告</h1>\n';
    }
    
    html += '</body>\n</html>';
    
    return html;
  }

  /**
   * 清空所有错误和警告
   */
  clear() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * 获取错误统计
   */
  getStats() {
    return {
      totalErrors: this.errors.length,
      totalWarnings: this.warnings.length,
      errorCodes: this.getErrorCodes(),
      warningCodes: this.getWarningCodes()
    };
  }

  /**
   * 获取错误代码统计
   */
  getErrorCodes() {
    const codeCounts = {};
    this.errors.forEach(error => {
      codeCounts[error.code] = (codeCounts[error.code] || 0) + 1;
    });
    return codeCounts;
  }

  /**
   * 获取警告代码统计
   */
  getWarningCodes() {
    const codeCounts = {};
    this.warnings.forEach(warning => {
      codeCounts[warning.code] = (codeCounts[warning.code] || 0) + 1;
    });
    return codeCounts;
  }
}

export {
  ERROR_CODES,
  ERROR_SEVERITY,
  FIX_TEMPLATES,
  EnhancedError,
  ErrorHandler
};

export default ErrorHandler;
