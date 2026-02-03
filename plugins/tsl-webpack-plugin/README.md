# tsl-webpack-plugin

TypeScript Lite Webpack 集成插件，为 Webpack 项目提供轻量级的 TypeScript 类型检查功能。

## 📦 安装

```bash
npm install --save-dev tsl-webpack-plugin typescript-lite
```

## 🚀 使用

### 基本配置

在 `webpack.config.js` 中添加插件：

```javascript
const { webpackPlugin: TslWebpackPlugin } = require('tsl-webpack-plugin');

module.exports = {
  plugins: [
    new TslWebpackPlugin({
      // 配置选项
      enableIncremental: true  // 启用增量编译
    })
  ]
};
```

### Webpack Loader

除了插件外，还可以使用 Webpack Loader 进行更细粒度的控制：

```javascript
const { webpackLoader } = require('tsl-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: require.resolve('tsl-webpack-plugin/webpack-loader'),
            options: {
              enableIncremental: true
            }
          }
        ]
      }
    ]
  }
};
```

### 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `enableIncremental` | `boolean` | `true` | 启用增量编译，提高构建速度 |
| `cacheDir` | `string` | `'.tsl-cache'` | 缓存目录路径 |
| `strict` | `boolean` | `false` | 启用严格模式检查 |
| `target` | `string` | `'esnext'` | 编译目标 ECMAScript 版本 |

## 📝 功能特性

- ✅ **实时类型检查**：在开发过程中实时检查类型错误
- ✅ **增量编译**：只处理变更文件，提高构建速度
- ✅ **支持 JSX/TSX**：支持 React 的 JSX/TSX 文件
- ✅ **支持 Vue SFC**：支持 Vue 单文件组件
- ✅ **详细错误信息**：提供详细的类型错误信息和修复建议
- ✅ **与 Webpack 完美集成**：无缝嵌入 Webpack 构建流程

## 🎯 支持的语法

- **基本类型**：`string`, `number`, `boolean`, `any`, `void`, `null`, `undefined`
- **函数类型**：函数参数和返回值类型注解
- **泛型**：泛型函数和泛型类型
- **联合类型**：`string | number`
- **接口**：`interface User { name: string; age: number; }`
- **类型别名**：`type StringOrNumber = string | number;`
- **类型推断**：自动推断变量类型

## 📚 示例

### React 项目

```jsx
// App.jsx
import { useState } from 'react'

interface User {
  name: string;
  age: number;
  email: string;
}

function App() {
  const [user, setUser] = useState<User>({
    name: '张三',
    age: 25,
    email: 'zhangsan@example.com'
  });

  return (
    <div>
      <h1>Hello, {user.name}!</h1>
      <p>Age: {user.age}</p>
      <p>Email: {user.email}</p>
    </div>
  )
}

export default App
```

### Vue 项目

```vue
<!-- UserInfo.vue -->
<template>
  <div>
    <p>Name: {{ user.name }}</p>
    <p>Age: {{ user.age }}</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

interface User {
  name: string;
  age: number;
}

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
});
</script>
```

## 🔧 开发

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/ereddate/typescript-lite.git
cd tsl-webpack-plugin

# 安装依赖
npm install

# 链接到本地项目
npm link
```

### 运行测试

```bash
npm test
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如果有任何问题，请在 GitHub 仓库中创建 Issue，或联系我们的团队。

---

**tsl-webpack-plugin** - 让 TypeScript 类型检查变得更轻量、更快！