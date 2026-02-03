/**
 * 高级类型系统模块
 * 支持条件类型、映射类型、类型守卫等高级特性
 */

/**
 * 条件类型：T extends U ? X : Y
 */
class ConditionalType {
  constructor(checkType, extendsType, trueType, falseType) {
    this.checkType = checkType;
    this.extendsType = extendsType;
    this.trueType = trueType;
    this.falseType = falseType;
  }

  /**
   * 评估条件类型
   */
  evaluate(typeMap, interfaces = {}, typeAliases = {}) {
    const checkResult = this.evaluateCheck(this.checkType, this.extendsType, typeMap, interfaces, typeAliases);
    return checkResult ? this.trueType : this.falseType;
  }

  /**
   * 评估类型检查
   */
  evaluateCheck(checkType, extendsType, typeMap, interfaces, typeAliases) {
    const resolvedCheckType = this.resolveType(checkType, typeMap, interfaces, typeAliases);
    const resolvedExtendsType = this.resolveType(extendsType, typeMap, interfaces, typeAliases);
    
    return this.isTypeAssignable(resolvedCheckType, resolvedExtendsType, interfaces, typeAliases);
  }

  /**
   * 解析类型
   */
  resolveType(type, typeMap, interfaces, typeAliases) {
    // 处理类型变量
    if (typeMap[type]) {
      return typeMap[type];
    }
    
    // 处理类型别名
    if (typeAliases[type]) {
      return this.resolveType(typeAliases[type], typeMap, interfaces, typeAliases);
    }
    
    return type;
  }

  /**
   * 检查类型是否可分配
   */
  isTypeAssignable(source, target, interfaces, typeAliases) {
    // 处理联合类型
    if (source.includes('|')) {
      const sourceTypes = source.split('|').map(t => t.trim());
      return sourceTypes.every(st => this.isTypeAssignable(st, target, interfaces, typeAliases));
    }
    
    if (target.includes('|')) {
      const targetTypes = target.split('|').map(t => t.trim());
      return targetTypes.some(tt => this.isTypeAssignable(source, tt, interfaces, typeAliases));
    }
    
    // 处理交叉类型
    if (source.includes('&')) {
      const sourceTypes = source.split('&').map(t => t.trim());
      return sourceTypes.some(st => this.isTypeAssignable(st, target, interfaces, typeAliases));
    }
    
    if (target.includes('&')) {
      const targetTypes = target.split('&').map(t => t.trim());
      return targetTypes.every(tt => this.isTypeAssignable(source, tt, interfaces, typeAliases));
    }
    
    // 处理接口类型
    if (interfaces[target]) {
      return source === 'object' || interfaces[source];
    }
    
    // 基本类型检查
    const typeHierarchy = {
      any: ['any', 'string', 'number', 'boolean', 'object', 'array', 'function', 'null', 'undefined'],
      string: ['string'],
      number: ['number'],
      boolean: ['boolean'],
      object: ['object'],
      array: ['array'],
      function: ['function'],
      null: ['null', 'any'],
      undefined: ['undefined', 'any']
    };
    
    return typeHierarchy[target]?.includes(source) || false;
  }
}

/**
 * 映射类型：{ [P in keyof T]: T[P] }
 */
class MappedType {
  constructor(sourceType, keyType, valueType) {
    this.sourceType = sourceType;
    this.keyType = keyType;
    this.valueType = valueType;
  }

  /**
   * 生成映射类型
   */
  generate(interfaces = {}, typeAliases = {}) {
    const resolvedSourceType = this.resolveType(this.sourceType, interfaces, typeAliases);
    
    // 如果源类型是接口
    if (interfaces[resolvedSourceType]) {
      const sourceInterface = interfaces[resolvedSourceType];
      const properties = {};
      
      for (const propName in sourceInterface.properties) {
        const propType = sourceInterface.properties[propName];
        const resolvedValueType = this.resolveValueType(propType, interfaces, typeAliases);
        properties[propName] = resolvedValueType;
      }
      
      return {
        type: 'interface',
        properties: properties
      };
    }
    
    // 如果源类型是对象字面量
    if (this.sourceType.startsWith('{') && this.sourceType.endsWith('}')) {
      const properties = this.parseObjectLiteral(this.sourceType);
      const mappedProperties = {};
      
      for (const propName in properties) {
        const propType = properties[propName];
        const resolvedValueType = this.resolveValueType(propType, interfaces, typeAliases);
        mappedProperties[propName] = resolvedValueType;
      }
      
      return {
        type: 'interface',
        properties: mappedProperties
      };
    }
    
    return null;
  }

  /**
   * 解析对象字面量
   */
  parseObjectLiteral(typeStr) {
    const properties = {};
    const content = typeStr.slice(1, -1).trim();
    
    if (!content) return properties;
    
    const propRegex = /(\w+)\s*:\s*([^,}]+)/g;
    let match;
    
    while ((match = propRegex.exec(content)) !== null) {
      properties[match[1]] = match[2].trim();
    }
    
    return properties;
  }

  /**
   * 解析值类型
   */
  resolveValueType(valueType, interfaces, typeAliases) {
    // 处理映射类型中的模板变量
    if (valueType === 'T[P]') {
      return this.valueType;
    }
    
    // 处理类型别名
    if (typeAliases[valueType]) {
      return this.resolveValueType(typeAliases[valueType], interfaces, typeAliases);
    }
    
    return valueType;
  }

  /**
   * 解析类型
   */
  resolveType(type, interfaces, typeAliases) {
    if (typeAliases[type]) {
      return this.resolveType(typeAliases[type], interfaces, typeAliases);
    }
    return type;
  }
}

/**
 * 类型守卫：arg is Type
 */
class TypeGuard {
  constructor(paramName, guardType) {
    this.paramName = paramName;
    this.guardType = guardType;
  }

  /**
   * 生成类型守卫函数
   */
  generate() {
    return {
      paramName: this.paramName,
      guardType: this.guardType,
      isTypeGuard: true
    };
  }
}

/**
 * 模板字面量类型：`hello${T}`
 */
class TemplateLiteralType {
  constructor(parts, typeVariable) {
    this.parts = parts;
    this.typeVariable = typeVariable;
  }

  /**
   * 生成模板字面量类型
   */
  generate(typeMap = {}) {
    const resolvedType = typeMap[this.typeVariable] || 'string';
    
    if (resolvedType === 'string') {
      return {
        type: 'template-literal',
        pattern: this.parts.join('${string}')
      };
    }
    
    return {
      type: 'string'
    };
  }
}

/**
 * 高级类型解析器
 */
class AdvancedTypeParser {
  constructor() {
    this.conditionalTypes = new Map();
    this.mappedTypes = new Map();
    this.typeGuards = new Map();
    this.templateLiteralTypes = new Map();
  }

  /**
   * 解析条件类型
   */
  parseConditionalType(typeStr) {
    const conditionalRegex = /(.+)\s+extends\s+(.+)\s+\?\s+(.+)\s*:\s*(.+)/;
    const match = typeStr.match(conditionalRegex);
    
    if (match) {
      const conditionalType = new ConditionalType(
        match[1].trim(),
        match[2].trim(),
        match[3].trim(),
        match[4].trim()
      );
      
      const key = `conditional_${this.conditionalTypes.size}`;
      this.conditionalTypes.set(key, conditionalType);
      
      return key;
    }
    
    return null;
  }

  /**
   * 解析映射类型
   */
  parseMappedType(typeStr) {
    const mappedRegex = /\{\s*\[P\s+in\s+keyof\s+([^\]]+)\]\s*:\s*([^\}]+)\}/;
    const match = typeStr.match(mappedRegex);
    
    if (match) {
      const mappedType = new MappedType(
        match[1].trim(),
        'P',
        match[2].trim()
      );
      
      const key = `mapped_${this.mappedTypes.size}`;
      this.mappedTypes.set(key, mappedType);
      
      return key;
    }
    
    return null;
  }

  /**
   * 解析类型守卫
   */
  parseTypeGuard(funcStr) {
    const guardRegex = /(\w+)\s+is\s+(\w+)/;
    const match = funcStr.match(guardRegex);
    
    if (match) {
      const typeGuard = new TypeGuard(
        match[1],
        match[2]
      );
      
      const key = `guard_${this.typeGuards.size}`;
      this.typeGuards.set(key, typeGuard);
      
      return key;
    }
    
    return null;
  }

  /**
   * 解析模板字面量类型
   */
  parseTemplateLiteralType(typeStr) {
    const templateRegex = /`([^`]*)\$\{(\w+)\}([^`]*)`/;
    const match = typeStr.match(templateRegex);
    
    if (match) {
      const templateLiteralType = new TemplateLiteralType(
        [match[1], match[3]],
        match[2]
      );
      
      const key = `template_${this.templateLiteralTypes.size}`;
      this.templateLiteralTypes.set(key, templateLiteralType);
      
      return key;
    }
    
    return null;
  }

  /**
   * 解析所有高级类型
   */
  parse(typeStr) {
    // 尝试解析条件类型
    const conditionalKey = this.parseConditionalType(typeStr);
    if (conditionalKey) return { type: 'conditional', key: conditionalKey };
    
    // 尝试解析映射类型
    const mappedKey = this.parseMappedType(typeStr);
    if (mappedKey) return { type: 'mapped', key: mappedKey };
    
    // 尝试解析模板字面量类型
    const templateKey = this.parseTemplateLiteralType(typeStr);
    if (templateKey) return { type: 'template', key: templateKey };
    
    return null;
  }

  /**
   * 评估高级类型
   */
  evaluate(typeKey, typeMap = {}, interfaces = {}, typeAliases = {}) {
    // 评估条件类型
    if (typeKey.startsWith('conditional_')) {
      const conditionalType = this.conditionalTypes.get(typeKey);
      if (conditionalType) {
        return conditionalType.evaluate(typeMap, interfaces, typeAliases);
      }
    }
    
    // 评估映射类型
    if (typeKey.startsWith('mapped_')) {
      const mappedType = this.mappedTypes.get(typeKey);
      if (mappedType) {
        return mappedType.generate(interfaces, typeAliases);
      }
    }
    
    // 评估模板字面量类型
    if (typeKey.startsWith('template_')) {
      const templateType = this.templateLiteralTypes.get(typeKey);
      if (templateType) {
        return templateType.generate(typeMap);
      }
    }
    
    return null;
  }

  /**
   * 获取类型守卫
   */
  getTypeGuard(guardKey) {
    return this.typeGuards.get(guardKey);
  }

  /**
   * 清空所有高级类型
   */
  clear() {
    this.conditionalTypes.clear();
    this.mappedTypes.clear();
    this.typeGuards.clear();
    this.templateLiteralTypes.clear();
  }
}

/**
 * 类型工具函数
 */
const TypeUtils = {
  /**
   * 检查类型是否为联合类型
   */
  isUnionType(type) {
    return type.includes('|');
  },

  /**
   * 检查类型是否为交叉类型
   */
  isIntersectionType(type) {
    return type.includes('&');
  },

  /**
   * 检查类型是否为条件类型
   */
  isConditionalType(type) {
    return type.includes('extends') && type.includes('?') && type.includes(':');
  },

  /**
   * 检查类型是否为映射类型
   */
  isMappedType(type) {
    return type.includes('[P in keyof');
  },

  /**
   * 检查类型是否为模板字面量类型
   */
  isTemplateLiteralType(type) {
    return type.startsWith('`') && type.includes('${');
  },

  /**
   * 提取联合类型的所有类型
   */
  extractUnionTypes(type) {
    if (!this.isUnionType(type)) return [type];
    return type.split('|').map(t => t.trim());
  },

  /**
   * 提取交叉类型的所有类型
   */
  extractIntersectionTypes(type) {
    if (!this.isIntersectionType(type)) return [type];
    return type.split('&').map(t => t.trim());
  },

  /**
   * 创建只读类型
   */
  createReadOnlyType(type) {
    return `Readonly<${type}>`;
  },

  /**
   * 创建可选类型
   */
  createOptionalType(type) {
    return `Partial<${type}>`;
  },

  /**
   * 创建必需类型
   */
  createRequiredType(type) {
    return `Required<${type}>`;
  },

  /**
   * 创建排除类型
   */
  createExcludeType(type, excluded) {
    return `Exclude<${type}, ${excluded}>`;
  },

  /**
   * 创建提取类型
   */
  createExtractType(type, extracted) {
    return `Extract<${type}, ${extracted}>`;
  },

  /**
   * 创建记录类型
   */
  createRecordType(keyType, valueType) {
    return `Record<${keyType}, ${valueType}>`;
  },

  /**
   * 创建选取类型
   */
  createPickType(type, keys) {
    return `Pick<${type}, ${keys}>`;
  },

  /**
   * 创建省略类型
   */
  createOmitType(type, keys) {
    return `Omit<${type}, ${keys}>`;
  }
};

export {
  ConditionalType,
  MappedType,
  TypeGuard,
  TemplateLiteralType,
  AdvancedTypeParser,
  TypeUtils
};

export default {
  ConditionalType,
  MappedType,
  TypeGuard,
  TemplateLiteralType,
  AdvancedTypeParser,
  TypeUtils
};
