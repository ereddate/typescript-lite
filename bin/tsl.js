#!/usr/bin/env node

// TypeScript Lite 命令行工具

import fs from 'fs';
import path from 'path';
import minimist from 'minimist';
import chalk from 'chalk';
import * as tsl from '../src/index.js';
import * as reporter from '../src/reporter/index.js';

// 解析命令行参数
const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    o: 'out',
    v: 'version'
  },
  boolean: ['help', 'version']
});

// 命令处理函数
function handleCommand() {
  const command = argv._[0];
  
  if (argv.help || command === '--help') {
    showHelp();
  } else if (argv.version || command === '--version') {
    showVersion();
  } else if (!command) {
    showHelp();
  } else if (command === 'check') {
    handleCheckCommand();
  } else if (command === 'compile') {
    handleCompileCommand();
  } else {
    console.error(`未知命令: ${command}`);
    showHelp();
  }
}

// 显示帮助信息
function showHelp() {
  console.log(`
TypeScript Lite 命令行工具

用法:
  tsl check <文件>       检查TypeScript Lite代码的类型
  tsl compile <文件>     编译TypeScript Lite代码为JavaScript
  tsl --help            显示帮助信息
  tsl --version         显示版本信息

选项:
  -o, --out <文件>      指定输出文件路径
  -h, --help            显示帮助信息
  -v, --version         显示版本信息

示例:
  tsl check src/main.ts
  tsl compile src/main.ts --out dist/main.js
`);
}

// 显示版本信息
function showVersion() {
  const pkgPath = path.join(__dirname, '..', 'package.json');
  const pkgContent = fs.readFileSync(pkgPath, 'utf8');
  const pkg = JSON.parse(pkgContent);
  console.log(`TypeScript Lite v${pkg.version}`);
}

// 处理检查命令
function handleCheckCommand() {
  const filePath = argv._[1];
  
  if (!filePath) {
    console.error('错误: 请指定要检查的文件');
    showHelp();
    return;
  }
  
  try {
    // 读取文件内容
    const code = fs.readFileSync(filePath, 'utf8');
    
    // 检查类型
    const result = tsl.check(code);
    
    // 报告错误
    reporter.reportErrors(result.errors, filePath);
    
    if (result.success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('检查失败:', error.message);
    process.exit(1);
  }
}

// 处理编译命令
function handleCompileCommand() {
  const filePath = argv._[1];
  const outPath = argv.out || argv.o;
  
  if (!filePath) {
    console.error('错误: 请指定要编译的文件');
    showHelp();
    return;
  }
  
  try {
    // 读取文件内容
    const code = fs.readFileSync(filePath, 'utf8');
    
    // 编译代码
    const result = tsl.compile(code);
    
    if (!result.success) {
      reporter.reportErrors(result.errors, filePath);
      process.exit(1);
    }
    
    // 写入输出文件
    if (outPath) {
      // 确保输出目录存在
      const outDir = path.dirname(outPath);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      
      fs.writeFileSync(outPath, result.code, 'utf8');
      console.log(chalk.green(`✅ 编译成功: ${outPath}`));
    } else {
      // 输出到控制台
      console.log(result.code);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('编译失败:', error.message);
    process.exit(1);
  }
}

// 执行命令
handleCommand();