# TypeScript Lite API 文档

## 目录

- [核心 API](#核心-api)
- [并行编译 API](#并行编译-api)
- [智能缓存 API](#智能缓存-api)
- [高级类型 API](#高级类型-api)
- [错误处理 API](#错误处理-api)
- [配置 API](#配置-api)

---

## 核心 API

### compile(code, options)

编译 TypeScript Lite 代码为 JavaScript 代码。

#### 参数

- `code` (string): TypeScript Lite 代码字符串
- `options` (object, 可选): 编译选项
  - `target` (string): 目标 ECMAScript 版本，默认为 `'esnext'`
  - `strict` (boolean): 是否启用严格模式，默认为 `false`
  - `sourceMap` (boolean): 是否生成 source map，默认为 `false`
  - `sourceMapWithCode` (boolean): 是否在 source map 中包含代码，默认为 `false`

#### 返回值

返回一个对象，包含以下属性：

- `success` (boolean): 编译是否成功
- `code` (string): 编译后的 JavaScript 代码（仅在成功时）
- `errors` (array): 错误数组（仅在失败时）
  - `message` (string): 错误消息
  - `line` (number): 错误行号
  - `column` (number): 错误列号
  - `code` (string): 错误代码

#### 示例

```javascript
import { compile } from 'typescript-lite';

const result = compile(`
  let message: string = "Hello";
  let count: number = 42;
`);

if (result.success) {
  console.log('编译成功:', result.code);
} else {
  console.error('编译失败:', result.errors);
}
```

---

### check(code, options)

检查 TypeScript Lite 代码的类型。

#### 参数

- `code` (string): TypeScript Lite 代码字符串
- `options` (object, 可选): 检查选项
  - `strict` (boolean): 是否启用严格模式，默认为 `false`
  - `noImplicitAny` (boolean): 是否禁止隐式 any 类型，默认为 `false`

#### 返回值

返回一个对象，包含以下属性：

- `success` (boolean): 类型检查是否通过
- `errors` (array): 错误数组
  - `message` (string): 错误消息
  - `line` (number): 错误行号
  - `column` (number): 错误列号
  - `code` (string): 错误代码
  - `severity` (string): 错误严重级别（`'error'` 或 `'warning'`）

#### 示例

```javascript
import { check } from 'typescript-lite';

const result = check(`
  let message: string = "Hello";
  let count: number = 42;
  message = 123; // 类型错误
`);

if (result.success) {
  console.log('类型检查通过');
} else {
  console.error('类型检查失败:', result.errors);
}
```

---

### compileFile(filePath, options)

编译 TypeScript Lite 文件。

#### 参数

- `filePath` (string): 文件路径
- `options` (object, 可选): 编译选项，同 `compile` 方法

#### 返回值

返回一个对象，包含以下属性：

- `success` (boolean): 编译是否成功
- `code` (string): 编译后的 JavaScript 代码（仅在成功时）
- `errors` (array): 错误数组（仅在失败时）
- `fromCache` (boolean): 结果是否来自缓存

#### 示例

```javascript
import { compileFile } from 'typescript-lite';

const result = compileFile('./src/app.ts');

if (result.success) {
  console.log('编译成功:', result.code);
  if (result.fromCache) {
    console.log('使用缓存结果');
  }
} else {
  console.error('编译失败:', result.errors);
}
```

---

### checkFile(filePath, options)

检查 TypeScript Lite 文件的类型。

#### 参数

- `filePath` (string): 文件路径
- `options` (object, 可选): 检查选项，同 `check` 方法

#### 返回值

返回一个对象，包含以下属性：

- `success` (boolean): 类型检查是否通过
- `errors` (array): 错误数组
- `fromCache` (boolean): 结果是否来自缓存

#### 示例

```javascript
import { checkFile } from 'typescript-lite';

const result = checkFile('./src/app.ts');

if (result.success) {
  console.log('类型检查通过');
  if (result.fromCache) {
    console.log('使用缓存结果');
  }
} else {
  console.error('类型检查失败:', result.errors);
}
```

---

### clearCache()

清空所有缓存。

#### 返回值

无返回值。

#### 示例

```javascript
import { clearCache } from 'typescript-lite';

clearCache();
console.log('缓存已清空');
```

---

## 并行编译 API

### ParallelCompiler

并行编译器类，支持多线程编译和检查。

#### 构造函数

```javascript
new ParallelCompiler(options)
```

##### 参数

- `options` (object, 可选): 配置选项
  - `maxWorkers` (number): 最大 Worker 数量，默认为 `4`

#### 方法

##### initialize()

初始化并行编译器。

```javascript
await compiler.initialize();
```

##### compileFiles(filePaths, options)

并行编译多个文件。

###### 参数

- `filePaths` (array): 文件路径数组
- `options` (object, 可选): 编译选项

###### 返回值

返回一个 Promise，解析为结果数组，每个元素包含：

- `filePath` (string): 文件路径
- `success` (boolean): 编译是否成功
- `code` (string): 编译后的代码（仅在成功时）
- `error` (string): 错误消息（仅在失败时）

###### 示例

```javascript
import { ParallelCompiler } from 'typescript-lite';

const compiler = new ParallelCompiler({ maxWorkers: 4 });
await compiler.initialize();

const results = await compiler.compileFiles([
  './src/file1.ts',
  './src/file2.ts',
  './src/file3.ts'
]);

results.forEach(result => {
  if (result.success) {
    console.log(`${result.filePath} 编译成功`);
  } else {
    console.error(`${result.filePath} 编译失败: ${result.error}`);
  }
});
```

##### checkFiles(filePaths, options)

并行检查多个文件的类型。

###### 参数

- `filePaths` (array): 文件路径数组
- `options` (object, 可选): 检查选项

###### 返回值

返回一个 Promise，解析为结果数组，每个元素包含：

- `filePath` (string): 文件路径
- `success` (boolean): 类型检查是否通过
- `errors` (array): 错误数组（仅在失败时）
- `error` (string): 错误消息（仅在失败时）

###### 示例

```javascript
import { ParallelCompiler } from 'typescript-lite';

const compiler = new ParallelCompiler({ maxWorkers: 4 });
await compiler.initialize();

const results = await compiler.checkFiles([
  './src/file1.ts',
  './src/file2.ts',
  './src/file3.ts'
]);

results.forEach(result => {
  if (result.success) {
    console.log(`${result.filePath} 类型检查通过`);
  } else {
    console.error(`${result.filePath} 类型检查失败: ${result.error}`);
  }
});
```

##### compileCodes(codes, options)

并行编译多个代码字符串。

###### 参数

- `codes` (array): 代码字符串数组
- `options` (object, 可选): 编译选项

###### 返回值

返回一个 Promise，解析为结果数组，每个元素包含：

- `success` (boolean): 编译是否成功
- `code` (string): 编译后的代码（仅在成功时）
- `error` (string): 错误消息（仅在失败时）

###### 示例

```javascript
import { ParallelCompiler } from 'typescript-lite';

const compiler = new ParallelCompiler({ maxWorkers: 4 });
await compiler.initialize();

const results = await compiler.compileCodes([
  'let x: string = "hello";',
  'let y: number = 42;',
  'let z: boolean = true;'
]);

results.forEach(result => {
  if (result.success) {
    console.log('编译成功:', result.code);
  } else {
    console.error('编译失败:', result.error);
  }
});
```

##### checkCodes(codes, options)

并行检查多个代码字符串的类型。

###### 参数

- `codes` (array): 代码字符串数组
- `options` (object, 可选): 检查选项

###### 返回值

返回一个 Promise，解析为结果数组，每个元素包含：

- `success` (boolean): 类型检查是否通过
- `errors` (array): 错误数组（仅在失败时）
- `error` (string): 错误消息（仅在失败时）

###### 示例

```javascript
import { ParallelCompiler } from 'typescript-lite';

const compiler = new ParallelCompiler({ maxWorkers: 4 });
await compiler.initialize();

const results = await compiler.checkCodes([
  'let x: string = "hello";',
  'let y: number = 42;',
  'let z: boolean = true;'
]);

results.forEach(result => {
  if (result.success) {
    console.log('类型检查通过');
  } else {
    console.error('类型检查失败:', result.error);
  }
});
```

##### shutdown()

关闭并行编译器，释放所有 Worker。

```javascript
await compiler.shutdown();
```

---

## 智能缓存 API

### SmartCache

智能缓存类，支持内存缓存、磁盘缓存和依赖跟踪。

#### 构造函数

```javascript
new SmartCache(options)
```

##### 参数

- `options` (object, 可选): 配置选项
  - `CACHE_DIR` (string): 缓存目录路径，默认为 `'.tsl-cache'`
  - `MEMORY_CACHE` (object): 内存缓存配置
    - `MAX_SIZE` (number): 最大缓存项数，默认为 `1000`
    - `TTL` (number): 缓存有效期（毫秒），默认为 `3600000`（1小时）
    - `CLEANUP_THRESHOLD` (number): 清理阈值，默认为 `0.8`
  - `DISK_CACHE` (object): 磁盘缓存配置
    - `MAX_SIZE` (number): 最大缓存大小（字节），默认为 `104857600`（100MB）
    - `TTL` (number): 缓存有效期（毫秒），默认为 `86400000`（24小时）
    - `COMPRESSION` (boolean): 是否启用压缩，默认为 `true`
  - `DEPENDENCY_TRACKING` (object): 依赖跟踪配置
    - `ENABLED` (boolean): 是否启用依赖跟踪，默认为 `true`
    - `MAX_DEPENDENCIES` (number): 最大依赖数，默认为 `1000`

#### 方法

##### initialize()

初始化智能缓存。

```javascript
await cache.initialize();
```

##### get(key)

获取缓存。

###### 参数

- `key` (string): 缓存键

###### 返回值

返回一个 Promise，解析为缓存值，如果不存在则返回 `null`。

###### 示例

```javascript
import SmartCache from 'typescript-lite/src/smart-cache/index.js';

const cache = new SmartCache();
await cache.initialize();

const value = await cache.get('my-key');
if (value !== null) {
  console.log('缓存命中:', value);
} else {
  console.log('缓存未命中');
}
```

##### set(key, value)

设置缓存。

###### 参数

- `key` (string): 缓存键
- `value` (any): 缓存值

###### 返回值

返回一个 Promise。

###### 示例

```javascript
import SmartCache from 'typescript-lite/src/smart-cache/index.js';

const cache = new SmartCache();
await cache.initialize();

await cache.set('my-key', { data: 'my-value' });
console.log('缓存已设置');
```

##### delete(key)

删除缓存。

###### 参数

- `key` (string): 缓存键

###### 返回值

返回一个 Promise。

###### 示例

```javascript
import SmartCache from 'typescript-lite/src/smart-cache/index.js';

const cache = new SmartCache();
await cache.initialize();

await cache.delete('my-key');
console.log('缓存已删除');
```

##### clear()

清空所有缓存。

###### 返回值

返回一个 Promise。

###### 示例

```javascript
import SmartCache from 'typescript-lite/src/smart-cache/index.js';

const cache = new SmartCache();
await cache.initialize();

await cache.clear();
console.log('所有缓存已清空');
```

##### addDependency(file, dependency)

添加文件依赖关系。

###### 参数

- `file` (string): 文件路径
- `dependency` (string): 依赖文件路径

###### 示例

```javascript
import SmartCache from 'typescript-lite/src/smart-cache/index.js';

const cache = new SmartCache();
await cache.initialize();

cache.addDependency('./src/app.ts', './src/utils.ts');
console.log('依赖关系已添加');
```

##### getAffectedFiles(changedFile)

获取受影响的文件。

###### 参数

- `changedFile` (string): 变更的文件路径

###### 返回值

返回一个 Set，包含所有受影响的文件路径。

###### 示例

```javascript
import SmartCache from 'typescript-lite/src/smart-cache/index.js';

const cache = new SmartCache();
await cache.initialize();

cache.addDependency('./src/app.ts', './src/utils.ts');
cache.addDependency('./src/main.ts', './src/app.ts');

const affected = cache.getAffectedFiles('./src/utils.ts');
console.log('受影响的文件:', affected);
// 输出: Set { './src/app.ts', './src/main.ts' }
```

##### getStats()

获取缓存统计信息。

###### 返回值

返回一个对象，包含：

- `memoryCache` (object): 内存缓存统计
  - `size` (number): 当前缓存项数
  - `maxSize` (number): 最大缓存项数
- `diskCache` (object): 磁盘缓存统计
  - `size` (number): 当前缓存项数
  - `totalSize` (number): 总缓存大小（字节）
  - `maxSize` (number): 最大缓存大小（字节）
- `dependencies` (object): 依赖统计
  - `files` (number): 文件数
  - `relationships` (number): 依赖关系数

###### 示例

```javascript
import SmartCache from 'typescript-lite/src/smart-cache/index.js';

const cache = new SmartCache();
await cache.initialize();

const stats = cache.getStats();
console.log('缓存统计:', stats);
```

---

## 高级类型 API

### ConditionalType

条件类型类，实现 `T extends U ? X : Y` 语法。

#### 构造函数

```javascript
new ConditionalType(checkType, extendsType, trueType, falseType)
```

##### 参数

- `checkType` (string): 要检查的类型
- `extendsType` (string): 扩展的类型
- `trueType` (string): 条件为真时的类型
- `falseType` (string): 条件为假时的类型

#### 方法

##### evaluate(typeMap, interfaces, typeAliases)

评估条件类型。

###### 参数

- `typeMap` (object): 类型变量映射
- `interfaces` (object): 接口定义
- `typeAliases` (object): 类型别名

###### 返回值

返回评估后的类型。

###### 示例

```javascript
import { ConditionalType } from 'typescript-lite/src/advanced-types/index.js';

const conditionalType = new ConditionalType('T', 'string', 'X', 'Y');
const result = conditionalType.evaluate({ T: 'string' });
console.log('评估结果:', result); // 输出: 'X'
```

---

### MappedType

映射类型类，实现 `{ [P in keyof T]: T[P] }` 语法。

#### 构造函数

```javascript
new MappedType(sourceType, keyType, valueType)
```

##### 参数

- `sourceType` (string): 源类型
- `keyType` (string): 键类型
- `valueType` (string): 值类型

#### 方法

##### generate(interfaces, typeAliases)

生成映射类型。

###### 参数

- `interfaces` (object): 接口定义
- `typeAliases` (object): 类型别名

###### 返回值

返回生成的映射类型。

###### 示例

```javascript
import { MappedType } from 'typescript-lite/src/advanced-types/index.js';

const mappedType = new MappedType('User', 'P', 'string');
const result = mappedType.generate({
  User: {
    properties: {
      name: 'string',
      age: 'number'
    }
  }
});
console.log('映射类型:', result);
```

---

### TypeUtils

类型工具函数集合。

#### 方法

##### isUnionType(type)

检查类型是否为联合类型。

###### 参数

- `type` (string): 类型字符串

###### 返回值

返回 `boolean`。

##### isIntersectionType(type)

检查类型是否为交叉类型。

###### 参数

- `type` (string): 类型字符串

###### 返回值

返回 `boolean`。

##### isConditionalType(type)

检查类型是否为条件类型。

###### 参数

- `type` (string): 类型字符串

###### 返回值

返回 `boolean`。

##### isMappedType(type)

检查类型是否为映射类型。

###### 参数

- `type` (string): 类型字符串

###### 返回值

返回 `boolean`。

##### isTemplateLiteralType(type)

检查类型是否为模板字面量类型。

###### 参数

- `type` (string): 类型字符串

###### 返回值

返回 `boolean`。

##### extractUnionTypes(type)

提取联合类型的所有类型。

###### 参数

- `type` (string): 类型字符串

###### 返回值

返回类型数组。

##### extractIntersectionTypes(type)

提取交叉类型的所有类型。

###### 参数

- `type` (string): 类型字符串

###### 返回值

返回类型数组。

##### createReadOnlyType(type)

创建只读类型。

###### 参数

- `type` (string): 类型字符串

###### 返回值

返回只读类型字符串。

##### createOptionalType(type)

创建可选类型。

###### 参数

- `type` (string): 类型字符串

###### 返回值

返回可选类型字符串。

##### createRequiredType(type)

创建必需类型。

###### 参数

- `type` (string): 类型字符串

###### 返回值

返回必需类型字符串。

##### createExcludeType(type, excluded)

创建排除类型。

###### 参数

- `type` (string): 类型字符串
- `excluded` (string): 要排除的类型

###### 返回值

返回排除类型字符串。

##### createExtractType(type, extracted)

创建提取类型。

###### 参数

- `type` (string): 类型字符串
- `extracted` (string): 要提取的类型

###### 返回值

返回提取类型字符串。

##### createRecordType(keyType, valueType)

创建记录类型。

###### 参数

- `keyType` (string): 键类型
- `valueType` (string): 值类型

###### 返回值

返回记录类型字符串。

##### createPickType(type, keys)

创建选取类型。

###### 参数

- `type` (string): 类型字符串
- `keys` (string): 要选取的键

###### 返回值

返回选取类型字符串。

##### createOmitType(type, keys)

创建省略类型。

###### 参数

- `type` (string): 类型字符串
- `keys` (string): 要省略的键

###### 返回值

返回省略类型字符串。

---

## 错误处理 API

### ErrorHandler

错误处理器类，提供增强的错误处理和报告功能。

#### 构造函数

```javascript
new ErrorHandler(options)
```

##### 参数

- `options` (object, 可选): 配置选项
  - `maxErrors` (number): 最大错误数，默认为 `100`
  - `maxWarnings` (number): 最大警告数，默认为 `100`

#### 方法

##### addError(error)

添加错误。

###### 参数

- `error` (object): 错误对象
  - `code` (string): 错误代码
  - `message` (string): 错误消息
  - `line` (number): 错误行号
  - `column` (number): 错误列号
  - `severity` (string): 错误严重级别
  - `source` (string): 错误源代码
  - `context` (string): 错误上下文
  - `relatedErrors` (array): 相关错误
  - `fixes` (array): 修复建议
  - `documentationUrl` (string): 文档 URL

##### addWarning(warning)

添加警告。

###### 参数

- `warning` (object): 警告对象，同 `addError` 的参数

##### addContextToErrors(source)

为错误添加上下文。

###### 参数

- `source` (string): 源代码

##### generateReport()

生成错误报告。

###### 返回值

返回一个对象，包含：

- `errors` (array): 错误数组
- `warnings` (array): 警告数组
- `summary` (object): 摘要
  - `totalErrors` (number): 总错误数
  - `totalWarnings` (number): 总警告数
  - `hasErrors` (boolean): 是否有错误
  - `hasWarnings` (boolean): 是否有警告

##### formatReport(format)

格式化错误报告。

###### 参数

- `format` (string): 格式类型，支持 `'text'`、`'json'`、`'html'`

###### 返回值

返回格式化后的报告字符串。

###### 示例

```javascript
import ErrorHandler from 'typescript-lite/src/error-handler/index.js';

const errorHandler = new ErrorHandler();
errorHandler.addError({
  code: 'TS-001',
  message: '类型不匹配',
  line: 10,
  column: 5,
  severity: 'error'
});

const report = errorHandler.formatReport('text');
console.log(report);
```

##### clear()

清空所有错误和警告。

##### getStats()

获取错误统计信息。

###### 返回值

返回一个对象，包含：

- `totalErrors` (number): 总错误数
- `totalWarnings` (number): 总警告数
- `errorCodes` (object): 错误代码统计
- `warningCodes` (object): 警告代码统计

---

## 配置 API

### config.merge(options)

合并配置选项。

#### 参数

- `options` (object): 配置选项

#### 返回值

返回合并后的配置对象。

#### 示例

```javascript
import { config } from 'typescript-lite';

const mergedConfig = config.merge({
  strict: true,
  target: 'es2015'
});

console.log('合并后的配置:', mergedConfig);
```

---

## 错误代码

### 类型错误

- `TS-001`: 类型不匹配
- `TS-002`: 类型未找到
- `TS-003`: 类型不兼容

### 函数错误

- `TS-101`: 函数参数类型不匹配
- `TS-102`: 函数返回值类型不匹配
- `TS-103`: 函数未找到

### 变量错误

- `TS-201`: 变量未声明
- `TS-202`: 变量重复声明
- `TS-203`: 变量类型不匹配

### 接口错误

- `TS-301`: 接口未找到
- `TS-302`: 接口属性不存在
- `TS-303`: 接口属性类型不匹配

### 泛型错误

- `TS-401`: 泛型类型未找到
- `TS-402`: 泛型约束违反

### 语法错误

- `TS-501`: 语法错误
- `TS-502`: 意外的标记
- `TS-503`: 缺少分号

---

## 最佳实践

### 1. 使用并行编译提高性能

对于大型项目，使用并行编译可以显著提高编译速度：

```javascript
import { ParallelCompiler } from 'typescript-lite';

const compiler = new ParallelCompiler({ maxWorkers: 4 });
await compiler.initialize();

const results = await compiler.compileFiles(filePaths);
```

### 2. 利用智能缓存

智能缓存可以自动管理缓存，提高重复编译的速度：

```javascript
import SmartCache from 'typescript-lite/src/smart-cache/index.js';

const cache = new SmartCache();
await cache.initialize();

// 缓存会自动管理，无需手动清理
```

### 3. 处理错误

使用错误处理器获取详细的错误信息和修复建议：

```javascript
import ErrorHandler from 'typescript-lite/src/error-handler/index.js';

const errorHandler = new ErrorHandler();
errorHandler.addError(error);

const report = errorHandler.formatReport('html');
console.log(report);
```

### 4. 配置优化

根据项目需求调整配置，获得最佳性能：

```javascript
import { config } from 'typescript-lite';

const optimizedConfig = config.merge({
  strict: false, // 关闭严格模式以提高性能
  target: 'esnext', // 使用最新特性
  sourceMap: false // 关闭 source map 以提高性能
});
```

---

## 更多资源

- [TypeScript Lite 主页](https://github.com/ereddate/typescript-lite)
- [TypeScript Lite 文档](https://github.com/ereddate/typescript-lite#readme)
- [TypeScript Lite 示例](https://github.com/ereddate/typescript-lite/tree/main/examples)
