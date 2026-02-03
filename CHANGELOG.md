# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- 并行编译功能，支持多线程处理
- 智能缓存系统，支持内存缓存、磁盘缓存和依赖跟踪
- 高级类型系统，支持条件类型、映射类型、类型守卫和模板字面量类型
- 增强的错误处理，提供详细的错误信息和修复建议
- VS Code 插件增强，支持代码完成、代码操作和悬停提示
- 配置文件支持，支持多种配置文件格式
- ESLint 和 Prettier 配置
- 详细的 API 文档
- 构建优化，支持 Rollup 打包

### Changed

- 优化缓存策略，提高缓存命中率
- 改进错误消息，提供更清晰的错误描述
- 优化解析性能，减少不必要的 AST 遍历

### Fixed

- 修复 JSX/TSX 文件类型注解移除问题
- 修复 Vue 组件中 `type` 配置被错误移除的问题
- 修复函数参数类型注解未完全移除的问题

### Performance

- 实现并行编译，提高编译速度
- 实现智能缓存，减少重复编译
- 优化正则表达式，提高解析效率

### Documentation

- 添加详细的 API 文档
- 添加配置文件文档
- 添加使用示例

## [1.0.0] - 2024-01-01

### Added

- 初始版本发布
- 基本类型检查功能
- 支持 Vue 和 React 集成
- 支持 Vite 和 Webpack 插件
- 支持 TypeScript 类型注解语法
- 支持基本类型、函数类型、接口、泛型
- 支持类型推断
- 支持 CLI 工具

### Features

- 类型检查：支持基本类型、函数类型、泛型、联合类型、接口、类型别名
- 代码生成：移除类型注解，生成纯 JavaScript 代码
- 框架集成：Vue（单文件组件）、React（JSX/TSX）、Vite/Webpack 插件
- CLI 工具：支持编译和检查命令
- 错误报告：提供清晰的错误信息和位置

### Documentation

- README 文档
- 使用示例
- 插件文档

[Unreleased]: https://github.com/ereddate/typescript-lite/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ereddate/typescript-lite/releases/tag/v1.0.0
