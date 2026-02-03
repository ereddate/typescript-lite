# TypeScript Lite

A lightweight TypeScript type checking tool that preserves TypeScript's core functionality while providing a more lightweight user experience.

## 🚀 Features

### Core Features
- ✅ **Basic Type Checking**: Supports `string`, `number`, `boolean` and other basic types
- ✅ **Function Types**: Supports function parameter and return value type annotations
- ✅ **Generic Support**: Implements generic functions like `function identity<T>(value: T): T`
- ✅ **Union Types**: Supports union types like `string | number`
- ✅ **Interface Support**: Supports interface definitions like `interface User { name: string; age: number; }`
- ✅ **Type Aliases**: Supports type aliases like `type StringOrNumber = string | number;`
- ✅ **Type Inference**: Automatically infers variable types, reducing explicit type annotations
- ✅ **Caching Mechanism**: Implements caching for compilation and type checking to improve performance

### Performance Optimization
- ✅ **Incremental Compilation**: Only processes changed files to improve build speed
- ✅ **File-level Caching**: Caches file compilation results to avoid redundant processing
- ✅ **File Change Detection**: Automatically detects file changes and intelligently uses cache
- ✅ **LRU Cache Strategy**: Implements cache size limits and LRU eviction strategy to improve cache efficiency
- ✅ **Optimized Cache Keys**: Uses hash functions to generate more compact and unique cache keys to improve hit rate
- ✅ **File Status Caching**: Caches file status information to reduce frequent I/O operations
- ✅ **Parsing Performance Optimization**: Precompiles regular expressions, merges similar replacement operations to improve parsing speed

### Framework Integration
- ✅ **Vue Integration**: Supports type checking for `.vue` single-file components
- ✅ **React Integration**: Supports type checking for `.tsx` files
- ✅ **Vite Plugin**: Seamlessly integrates with Vite build tool
- ✅ **Webpack Plugin**: Supports use in Webpack build process

### IDE Integration
- ✅ **VS Code Plugin**: Provides real-time type checking and error hints
- ✅ **Editor Integration**: Displays type errors in the editor
- ✅ **Intelligent Hints**: Provides type-related intelligent hints

### Error Message Improvement
- ✅ **Detailed Error Messages**: Provides more detailed and instructive error messages
- ✅ **Error Context**: Displays code context where errors occur to help locate problems
- ✅ **Error Fix Suggestions**: Provides specific error fix suggestions and example code
- ✅ **Error Codes**: Assigns unique error codes to each error for easy lookup and understanding

## 📦 Installation

### Global Installation
```bash
npm install -g typescript-lite
```

### Project Installation
```bash
npm install --save-dev typescript-lite
```

## 🚗 Usage

### Command Line Tool

#### Check Types
```bash
# Check a single file
tsl check file.ts

# Check an entire directory
tsl check src/
```

#### Compile Code
```bash
# Compile a single file
tsl compile file.ts

# Compile an entire directory
tsl compile src/ --outDir dist/
```

### Incremental Compilation

#### Compile File (Supports Incremental Compilation)
```javascript
const tsl = require('typescript-lite');

// Compile file (automatically detects file changes)
const result = tsl.compileFile('src/file.ts');

if (result.success) {
  console.log('Compilation successful:', result.code);
} else {
  console.log('Compilation failed:', result.errors);
}
```

#### Check File (Supports Incremental Compilation)
```javascript
const tsl = require('typescript-lite');

// Check file (automatically detects file changes)
const result = tsl.checkFile('src/file.ts');

if (result.success) {
  console.log('Type check passed');
} else {
  console.log('Type check failed:', result.errors);
}
```

### VS Code Plugin

#### Install Plugin
1. Open VS Code
2. Click the Extensions icon on the left
3. Search for "TypeScript Lite"
4. Click "Install"

#### Configure Plugin
In VS Code settings, you can configure the following options:

```json
{
  "typescript-lite.enable": true,    // Enable TypeScript Lite type checking
  "typescript-lite.debug": false     // Enable debug mode
}
```

#### Use Plugin
The plugin will automatically activate and check the following types of files:
- `.js`, `.jsx` files
- `.ts`, `.tsx` files

When there are type errors in the file, the plugin will display red wavy lines in the editor and list all errors in the Problems panel.

## 🔧 Build Tool Integration

### Vite Integration
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import { vitePlugin as tslVitePlugin } from 'tsl-vite-plugin'

export default defineConfig({
  plugins: [
    tslVitePlugin({
      // Configuration options
      enableIncremental: true  // Enable incremental compilation
    })
  ]
})
```

### Webpack Integration
```javascript
// webpack.config.js
const { webpackPlugin: TslWebpackPlugin } = require('tsl-webpack-plugin');

module.exports = {
  plugins: [
    new TslWebpackPlugin({
      // Configuration options
      enableIncremental: true  // Enable incremental compilation
    })
  ]
};
```

## 📝 Syntax Examples

### Basic Types
```typescript
// Variable type annotations
let message: string = "Hello";
let count: number = 42;
let isActive: boolean = true;

// Function type annotations
function add(a: number, b: number): number {
  return a + b;
}
```

### Generics
```typescript
// Generic function
function identity<T>(value: T): T {
  return value;
}

// Using generics
let str = identity<string>("Hello");
let num = identity<number>(42);
```

### Union Types
```typescript
// Union type
let value: string | number = "Hello";
value = 42; // Valid

// Function parameter union type
function formatValue(value: string | number): string {
  return String(value);
}
```

### Interfaces
```typescript
// Interface definition
interface User {
  name: string;
  age: number;
}

// Using interface
let user: User = { name: "Zhang San", age: 20 };

// Function parameter using interface
function greet(user: User): string {
  return `Hello, ${user.name}!`;
}
```

### Type Aliases
```typescript
// Type aliases
type StringOrNumber = string | number;
type UserObject = {
  name: string;
  age: number;
};

// Using type aliases
let value: StringOrNumber = "Hello";
value = 42; // Valid

let user: UserObject = { name: "Zhang San", age: 20 };
```

### Type Inference
```typescript
// Type inference
let name = "Zhang San"; // Inferred as string
let age = 20; // Inferred as number
let isActive = true; // Inferred as boolean

// Function return type inference
function add(a: number, b: number) {
  return a + b; // Inferred return type as number
}
```

## 🚀 Performance Optimization

### Incremental Compilation
TypeScript Lite implements intelligent incremental compilation functionality, only processing changed files to improve build speed.

#### Working Principle
1. **File Status Caching**: Caches file modification time and size
2. **File Change Detection**: Checks if files have changed
3. **Intelligent Caching**: Uses cached results for unchanged files
4. **Recompilation**: Recompiles changed files

#### Usage Example
```javascript
const tsl = require('typescript-lite');

// First compilation (no cache)
const result1 = tsl.compileFile('src/file.ts');

// Second compilation (file unchanged, uses cache)
const result2 = tsl.compileFile('src/file.ts');

// Compilation after modifying file (file changed, recompiles)
// Modify src/file.ts content
const result3 = tsl.compileFile('src/file.ts');
```

## 📚 API Documentation

### Core API

#### compile(code, options)
- **Parameters**:
  - `code`: TypeScript Lite code string
  - `options`: Compilation options
- **Return Value**: Compilation result object

#### check(code, options)
- **Parameters**:
  - `code`: TypeScript Lite code string
  - `options`: Check options
- **Return Value**: Type check result object

#### compileFile(filePath, options)
- **Parameters**:
  - `filePath`: File path
  - `options`: Compilation options
- **Return Value**: Compilation result object (supports incremental compilation)

#### checkFile(filePath, options)
- **Parameters**:
  - `filePath`: File path
  - `options`: Check options
- **Return Value**: Type check result object (supports incremental compilation)

#### clearCache()
- **Functionality**: Clears all caches
- **Return Value**: None

## 🔍 Common Questions

### Q: What's the difference between TypeScript Lite and TypeScript?
A: TypeScript Lite is a lightweight alternative to TypeScript that preserves TypeScript's core type checking functionality but is more lightweight and has faster compilation speed.

### Q: How much performance improvement does incremental compilation provide?
A: Incremental compilation can significantly improve build speed, especially in large projects. For unchanged files, build speed can be improved by 10-100 times.

### Q: How does the VS Code plugin work?
A: The VS Code plugin automatically runs TypeScript Lite for type checking when files change and displays error hints in the editor.

### Q: How to use TypeScript Lite in frameworks?
A: TypeScript Lite provides integration plugins for Vue, React, Vite, and Webpack, which can be directly used in these frameworks.

## 🤝 Contribution

Contributions are welcome! If you have any questions or suggestions, please create an Issue or Pull Request on GitHub.

## 📄 License

MIT License

## 🎉 Acknowledgements

- [TypeScript](https://www.typescriptlang.org/) - Provided design inspiration for the type system
- [Acorn](https://github.com/acornjs/acorn) - Provided JavaScript parsing functionality
- [VS Code](https://code.visualstudio.com/) - Provided the platform for IDE integration

---

**TypeScript Lite** - A lightweight TypeScript type checking tool that makes type checking simpler and faster!