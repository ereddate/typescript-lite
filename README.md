# TypeScript Lite

轻量级TypeScript类型检查工具，保留TypeScript核心功能，提供更轻量的使用体验。

## 🚀 功能特性

### 核心功能
- ✅ **基本类型检查**：支持 `string`、`number`、`boolean` 等基本类型
- ✅ **函数类型**：支持函数参数和返回值类型注解
- ✅ **泛型支持**：实现了 `function identity<T>(value: T): T` 这样的泛型函数
- ✅ **联合类型**：支持 `string | number` 这样的联合类型
- ✅ **接口支持**：支持 `interface User { name: string; age: number; }` 这样的接口定义
- ✅ **类型别名**：支持 `type StringOrNumber = string | number;` 这样的类型别名
- ✅ **类型推断**：自动推断变量类型，减少显式类型注解
- ✅ **缓存机制**：实现了编译和类型检查的缓存，提高性能

### 性能优化
- ✅ **增量编译**：只处理变更的文件，提高构建速度
- ✅ **文件级缓存**：缓存文件编译结果，避免重复处理
- ✅ **文件变更检测**：自动检测文件是否变更，智能使用缓存
- ✅ **LRU缓存策略**：实现了缓存大小限制和LRU淘汰策略，提高缓存效率
- ✅ **优化的缓存键**：使用哈希函数生成更紧凑、更独特的缓存键，提高命中率
- ✅ **文件状态缓存**：缓存文件状态信息，减少频繁的I/O操作
- ✅ **解析性能优化**：预编译正则表达式，合并相似的替换操作，提高解析速度

### 框架集成
- ✅ **Vue 集成**：支持 `.vue` 单文件组件的类型检查
- ✅ **React 集成**：支持 `.tsx` 文件的类型检查
- ✅ **Vite 插件**：与 Vite 构建工具无缝集成
- ✅ **Webpack 插件**：支持在 Webpack 构建流程中使用

### IDE 集成
- ✅ **VS Code 插件**：提供实时类型检查和错误提示
- ✅ **编辑器集成**：在编辑器中显示类型错误
- ✅ **智能提示**：提供类型相关的智能提示

### 错误信息改进
- ✅ **详细错误信息**：提供更详细、更有指导性的错误信息
- ✅ **错误上下文**：显示错误发生的代码上下文，帮助定位问题
- ✅ **错误修复建议**：提供具体的错误修复建议和示例代码
- ✅ **错误代码**：为每个错误分配唯一的错误代码，方便查找和理解

## 📦 安装

### 全局安装
```bash
npm install -g typescript-lite
```

### 项目内安装
```bash
npm install --save-dev typescript-lite
```

## 🚗 使用方法

### 命令行工具

#### 检查类型
```bash
# 检查单个文件
tsl check file.ts

# 检查整个目录
tsl check src/
```

#### 编译代码
```bash
# 编译单个文件
tsl compile file.ts

# 编译整个目录
tsl compile src/ --outDir dist/
```

### 增量编译

#### 编译文件（支持增量编译）
```javascript
const tsl = require('typescript-lite');

// 编译文件（会自动检测文件变更）
const result = tsl.compileFile('src/file.ts');

if (result.success) {
  console.log('编译成功:', result.code);
} else {
  console.log('编译失败:', result.errors);
}
```

#### 检查文件（支持增量编译）
```javascript
const tsl = require('typescript-lite');

// 检查文件（会自动检测文件变更）
const result = tsl.checkFile('src/file.ts');

if (result.success) {
  console.log('类型检查通过');
} else {
  console.log('类型检查失败:', result.errors);
}
```

### VS Code 插件

#### 安装插件
1. 打开 VS Code
2. 点击左侧的扩展图标
3. 搜索 "TypeScript Lite"
4. 点击 "安装"

#### 配置插件
在 VS Code 的设置中，可以配置以下选项：

```json
{
  "typescript-lite.enable": true,    // 启用 TypeScript Lite 类型检查
  "typescript-lite.debug": false     // 启用调试模式
}
```

#### 使用插件
插件会自动激活并检查以下类型的文件：
- `.js`、`.jsx` 文件
- `.ts`、`.tsx` 文件

当文件中有类型错误时，插件会在编辑器中显示红色波浪线，并在问题面板中列出所有错误。

## 🔧 构建工具集成

### Vite 集成
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import { vitePlugin as tslVitePlugin } from 'typescript-lite/vite'

export default defineConfig({
  plugins: [
    tslVitePlugin({
      // 配置选项
      enableIncremental: true  // 启用增量编译
    })
  ]
})
```

### Webpack 集成
```javascript
// webpack.config.js
const { webpackPlugin: tslWebpackPlugin } = require('typescript-lite/webpack');

module.exports = {
  plugins: [
    new tslWebpackPlugin({
      // 配置选项
      enableIncremental: true  // 启用增量编译
    })
  ]
};
```

## 📝 语法示例

### 基本类型
```typescript
// 变量类型注解
let message: string = "Hello";
let count: number = 42;
let isActive: boolean = true;

// 函数类型注解
function add(a: number, b: number): number {
  return a + b;
}
```

### 泛型
```typescript
// 泛型函数
function identity<T>(value: T): T {
  return value;
}

// 使用泛型
let str = identity<string>("Hello");
let num = identity<number>(42);
```

### 联合类型
```typescript
// 联合类型
let value: string | number = "Hello";
value = 42; // 合法

// 函数参数联合类型
function formatValue(value: string | number): string {
  return String(value);
}
```

### 接口
```typescript
// 接口定义
interface User {
  name: string;
  age: number;
}

// 使用接口
let user: User = { name: "张三", age: 20 };

// 函数参数使用接口
function greet(user: User): string {
  return `Hello, ${user.name}!`;
}
```

### 类型别名
```typescript
// 类型别名
type StringOrNumber = string | number;
type UserObject = {
  name: string;
  age: number;
};

// 使用类型别名
let value: StringOrNumber = "Hello";
value = 42; // 合法

let user: UserObject = { name: "张三", age: 20 };
```

### 类型推断
```typescript
// 类型推断
let name = "张三"; // 推断为 string
let age = 20; // 推断为 number
let isActive = true; // 推断为 boolean

// 函数返回值类型推断
function add(a: number, b: number) {
  return a + b; // 推断返回类型为 number
}
```

## 🚀 性能优化

### 增量编译
TypeScript Lite 实现了智能的增量编译功能，只处理变更的文件，提高构建速度。

#### 工作原理
1. **文件状态缓存**：缓存文件的修改时间和大小
2. **文件变更检测**：检查文件是否变更
3. **智能缓存**：未变更的文件使用缓存结果
4. **重新编译**：变更的文件重新编译

#### 使用示例
```javascript
const tsl = require('typescript-lite');

// 第一次编译（无缓存）
const result1 = tsl.compileFile('src/file.ts');

// 第二次编译（文件未变更，使用缓存）
const result2 = tsl.compileFile('src/file.ts');

// 修改文件后编译（文件变更，重新编译）
// 修改 src/file.ts 内容
const result3 = tsl.compileFile('src/file.ts');
```

## 📚 API 文档

### 核心 API

#### compile(code, options)
- **参数**：
  - `code`: TypeScript Lite 代码字符串
  - `options`: 编译选项
- **返回值**：编译结果对象

#### check(code, options)
- **参数**：
  - `code`: TypeScript Lite 代码字符串
  - `options`: 检查选项
- **返回值**：类型检查结果对象

#### compileFile(filePath, options)
- **参数**：
  - `filePath`: 文件路径
  - `options`: 编译选项
- **返回值**：编译结果对象（支持增量编译）

#### checkFile(filePath, options)
- **参数**：
  - `filePath`: 文件路径
  - `options`: 检查选项
- **返回值**：类型检查结果对象（支持增量编译）

#### clearCache()
- **功能**：清空所有缓存
- **返回值**：无

## 🔍 常见问题

### Q: TypeScript Lite 与 TypeScript 有什么区别？
A: TypeScript Lite 是一个轻量级的 TypeScript 替代方案，保留了 TypeScript 的核心类型检查功能，但更加轻量，编译速度更快。

### Q: 增量编译能提高多少性能？
A: 增量编译可以显著提高构建速度，特别是在大型项目中。对于未变更的文件，构建速度可以提高 10-100 倍。

### Q: VS Code 插件如何工作？
A: VS Code 插件会在文件变更时自动运行 TypeScript Lite 进行类型检查，并在编辑器中显示错误提示。

### Q: 如何在框架中使用 TypeScript Lite？
A: TypeScript Lite 提供了与 Vue、React、Vite 和 Webpack 的集成插件，可以直接在这些框架中使用。

## 🤝 贡献

欢迎贡献代码和提出问题！如果您有任何问题或建议，请在 GitHub 上创建 Issue 或 Pull Request。

## 📄 许可证

MIT License

## 🎉 鸣谢

- [TypeScript](https://www.typescriptlang.org/) - 提供了类型系统的设计灵感
- [Acorn](https://github.com/acornjs/acorn) - 提供了 JavaScript 解析功能
- [VS Code](https://code.visualstudio.com/) - 提供了 IDE 集成的平台

---

**TypeScript Lite** - 轻量级 TypeScript 类型检查工具，让类型检查更简单、更快速！
