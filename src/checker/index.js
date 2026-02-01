// 类型检查器模块

const estraverse = require('estraverse');

/**
 * 从代码中提取变量类型注解
 * @param {string} code - TypeScript Lite代码
 * @returns {object} 变量类型映射
 */
function extractVariableTypes(code) {
  const types = {};
  // 支持联合类型和交叉类型
  const varRegex = /let\s+(\w+)\s*:\s*([\w|\s&]+)\s*=/g;
  let match;
  
  while ((match = varRegex.exec(code)) !== null) {
    types[match[1]] = match[2].trim();
  }
  
  return types;
}

/**
 * 从代码中提取函数类型注解
 * @param {string} code - TypeScript Lite代码
 * @returns {object} 函数类型映射
 */
function extractFunctionTypes(code) {
  const functions = {};
  // 匹配普通函数和泛型函数，支持联合类型和交叉类型
  const funcRegex = /function\s+(\w+)\s*(?:<[\w, ]+>)?\s*\(([^)]*)\)\s*:\s*([\w|\s&]+)/g;
  let match;
  
  while ((match = funcRegex.exec(code)) !== null) {
    const params = [];
    // 匹配参数类型，包括泛型类型T和联合类型
    const paramRegex = /(\w+)\s*:\s*([\w|\s&]+)/g;
    let paramMatch;
    
    while ((paramMatch = paramRegex.exec(match[2])) !== null) {
      params.push({ name: paramMatch[1], type: paramMatch[2].trim() });
    }
    
    functions[match[1]] = {
      params: params,
      returnType: match[3].trim(),
      isGeneric: match[0].includes('<') // 标记是否为泛型函数
    };
  }
  
  return functions;
}

/**
 * 从代码中提取接口定义
 * @param {string} code - TypeScript Lite代码
 * @returns {object} 接口定义映射
 */
function extractInterfaces(code) {
  const interfaces = {};
  // 匹配接口定义
  const interfaceRegex = /interface\s+(\w+)\s*\{([\s\S]*?)\}/g;
  let match;
  
  while ((match = interfaceRegex.exec(code)) !== null) {
    const interfaceName = match[1];
    const body = match[2];
    
    // 提取接口属性
    const properties = {};
    const propRegex = /(\w+)\s*:\s*([\w|\s&]+);/g;
    let propMatch;
    
    while ((propMatch = propRegex.exec(body)) !== null) {
      properties[propMatch[1]] = propMatch[2].trim();
    }
    
    interfaces[interfaceName] = {
      properties: properties
    };
  }
  
  return interfaces;
}

/**
 * 从代码中提取类型别名
 * @param {string} code - TypeScript Lite代码
 * @returns {object} 类型别名映射
 */
function extractTypeAliases(code) {
  const aliases = {};
  // 匹配类型别名定义
  const typeRegex = /type\s+(\w+)\s*=\s*([\w|\s&]+);/g;
  let match;
  
  while ((match = typeRegex.exec(code)) !== null) {
    aliases[match[1]] = match[2].trim();
  }
  
  return aliases;
}

/**
 * 类型检查器
 * @param {object} ast - 抽象语法树
 * @param {object} options - 检查选项
 * @param {string} originalCode - 原始TypeScript Lite代码
 * @returns {array} 类型错误列表
 */
function check(ast, options = {}, originalCode = '') {
  const errors = [];
  
  // 提取接口定义
  const interfaces = extractInterfaces(originalCode);
  // 提取类型别名
  const typeAliases = extractTypeAliases(originalCode);
  
  // 提取类型信息
  const variableTypes = extractVariableTypes(originalCode);
  const functionTypes = extractFunctionTypes(originalCode);
  
  // 遍历AST进行类型检查
  estraverse.traverse(ast, {
    enter: function(node) {
      // 检查变量声明的类型
      if (node.type === 'VariableDeclarator') {
        checkVariableDeclaration(node, errors, options, variableTypes, interfaces, typeAliases);
      }
      
      // 检查函数声明的类型
      if (node.type === 'FunctionDeclaration') {
        checkFunction(node, errors, options, functionTypes);
      }
      
      // 检查函数调用的类型
      if (node.type === 'CallExpression' && node.callee.type === 'Identifier') {
        checkCallExpression(node, errors, options, functionTypes, interfaces, typeAliases);
      }
    }
  });
  
  return errors;
}

/**
 * 检查变量声明的类型
 * @param {object} node - 变量声明节点
 * @param {array} errors - 错误列表
 * @param {object} options - 检查选项
 * @param {object} variableTypes - 变量类型映射
 */
// 类型推断结果缓存
const inferredTypes = {};

/**
 * 推断变量类型
 * @param {string} varName - 变量名
 * @param {object} initValue - 初始化值节点
 * @returns {string} 推断的类型
 */
function inferVariableType(varName, initValue) {
  if (!initValue) return 'any';
  
  const inferredType = getActualType(initValue);
  // 缓存推断结果
  inferredTypes[varName] = inferredType;
  return inferredType;
}

/**
 * 检查变量声明的类型
 * @param {object} node - 变量声明节点
 * @param {array} errors - 错误列表
 * @param {object} options - 检查选项
 * @param {object} variableTypes - 变量类型映射
 */
function checkVariableDeclaration(node, errors, options, variableTypes, interfaces = {}, typeAliases = {}) {
  const varName = node.id.name;
  const expectedType = variableTypes[varName];
  
  if (expectedType) {
    const initValue = node.init;
    
    // 检查初始化值的类型
    if (initValue) {
      const actualType = getActualType(initValue);
      if (!isTypeCompatible(expectedType, actualType, interfaces, typeAliases)) {
        errors.push({
          message: `类型错误：变量 ${varName} 期望类型 ${expectedType}，实际类型 ${actualType}`,
          line: node.loc?.start.line || 0,
          column: node.loc?.start.column || 0,
          severity: 'error',
          code: 'type-mismatch',
          fix: {
            message: `建议：将变量 ${varName} 的值修改为 ${expectedType} 类型`,
            example: `let ${varName}: ${expectedType} = ${getDefaultValue(expectedType)};`
          }
        });
      }
    }
  } else {
    // 没有显式类型标注，进行类型推断
    const initValue = node.init;
    if (initValue) {
      const inferredType = inferVariableType(varName, initValue);
      // 可以在这里添加日志，显示类型推断结果
      // console.log(`类型推断：变量 ${varName} 推断为 ${inferredType} 类型`);
    }
  }
}

/**
 * 检查函数的类型
 * @param {object} node - 函数节点
 * @param {array} errors - 错误列表
 * @param {object} options - 检查选项
 * @param {object} functionTypes - 函数类型映射
 */
/**
 * 检查函数的类型
 * @param {object} node - 函数节点
 * @param {array} errors - 错误列表
 * @param {object} options - 检查选项
 * @param {object} functionTypes - 函数类型映射
 */
function checkFunction(node, errors, options, functionTypes) {
  const funcName = node.id?.name;
  if (funcName && functionTypes[funcName]) {
    const funcType = functionTypes[funcName];
    // 这里简化处理，实际需要检查函数体返回值类型
  }
}

/**
 * 检查函数调用的类型
 * @param {object} node - 函数调用节点
 * @param {array} errors - 错误列表
 * @param {object} options - 检查选项
 * @param {object} functionTypes - 函数类型映射
 */
function checkCallExpression(node, errors, options, functionTypes, interfaces = {}, typeAliases = {}) {
  const funcName = node.callee.name;
  if (funcName && functionTypes[funcName]) {
    const funcType = functionTypes[funcName];
    const params = funcType.params;
    
    // 检查参数类型
    node.arguments.forEach((arg, index) => {
      if (index < params.length) {
        const param = params[index];
        let actualType;
        
        // 如果是标识符，尝试使用推断的类型
        if (arg.type === 'Identifier') {
          actualType = inferredTypes[arg.name] || getActualType(arg);
        } else {
          actualType = getActualType(arg);
        }
        
        if (!isTypeCompatible(param.type, actualType, interfaces, typeAliases)) {
          errors.push({
            message: `类型错误：函数 ${funcName} 参数 ${index + 1} 期望类型 ${param.type}，实际类型 ${actualType}`,
            line: node.loc?.start.line || 0,
            column: node.loc?.start.column || 0,
            severity: 'error',
            code: 'function-arg-type-mismatch',
            fix: {
              message: `建议：将参数修改为 ${param.type} 类型`,
              example: `${funcName}(${getDefaultValue(param.type)})`
            }
          });
        }
      }
    });
  }
}

/**
 * 获取表达式的实际类型
 * @param {object} node - 表达式节点
 * @returns {string} 实际类型
 */
function getActualType(node) {
  if (node.type === 'Literal') {
    if (typeof node.value === 'string') return 'string';
    if (typeof node.value === 'number') return 'number';
    if (typeof node.value === 'boolean') return 'boolean';
    if (node.value === null) return 'null';
  } else if (node.type === 'Identifier') {
    // 这里简化处理，实际需要符号表查找
    return 'any';
  } else if (node.type === 'ObjectExpression') {
    return 'object';
  } else if (node.type === 'ArrayExpression') {
    return 'array';
  } else if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
    return 'function';
  }
  return 'any';
}

/**
 * 检查类型是否兼容
 * @param {string} expectedType - 期望类型
 * @param {string} actualType - 实际类型
 * @returns {boolean} 是否兼容
 */
function getDefaultValue(type) {
  const typeMap = {
    string: "''",
    number: '0',
    boolean: 'false',
    object: '{}',
    array: '[]',
    function: '() => {}',
    any: 'undefined'
  };
  return typeMap[type] || 'undefined';
}

function isTypeCompatible(expectedType, actualType, interfaces = {}, typeAliases = {}) {
  if (expectedType === 'any' || actualType === 'any') {
    return true;
  }
  
  // 处理泛型类型T
  if (expectedType === 'T') {
    return true; // 泛型类型T可以接受任何类型
  }
  
  // 处理联合类型（如 string | number）
  if (expectedType.includes('|')) {
    const types = expectedType.split('|').map(t => t.trim());
    return types.some(type => isTypeCompatible(type, actualType, interfaces, typeAliases));
  }
  
  // 处理交叉类型（简化处理，暂时允许任何类型）
  if (expectedType.includes('&')) {
    return true; // 简化版暂时允许任何类型通过交叉类型检查
  }
  
  // 处理接口类型
  if (interfaces[expectedType]) {
    // 如果实际类型是object，认为它可能符合接口
    // 实际应该检查对象的属性是否符合接口定义
    return actualType === 'object';
  }
  
  // 处理类型别名
  if (typeAliases[expectedType]) {
    return isTypeCompatible(typeAliases[expectedType], actualType, interfaces, typeAliases);
  }
  
  // 基本类型兼容检查
  const typeMap = {
    string: ['string'],
    number: ['number'],
    boolean: ['boolean'],
    object: ['object'],
    array: ['array'],
    function: ['function']
  };
  
  return typeMap[expectedType]?.includes(actualType) || false;
}

module.exports = {
  check,
  getActualType,
  isTypeCompatible,
  extractVariableTypes,
  extractFunctionTypes
};