// React集成测试用例

const tsl = require('../src/index');

// 测试React TypeScript文件
const reactTsxCode = `
import React, { useState } from 'react';

// @type string
const title: string = 'React TypeScript Lite';

// @param {string} name
// @returns {JSX.Element}
function Greeting({ name }: { name: string }): JSX.Element {
  // @type [string, (value: string) => void]
  const [message, setMessage] = useState<string>('Hello');
  
  return (
    <div>
      <h1>{title}</h1>
      <p>{message} {name}!</p>
      <button onClick={() => setMessage('Hi')}>Change Message</button>
    </div>
  );
}

// @param {string} name
// @returns {string}
function formatName(name: string): string {
  return name.toUpperCase();
}

export { Greeting, formatName };
`;

// 测试React插件
function testReactPlugin() {
  console.log('=== React 集成测试 ===\n');
  
  // 测试React TSX文件
  const checkResult = tsl.check(reactTsxCode);
  if (checkResult.success) {
    console.log('✅ React TSX文件类型检查通过');
  } else {
    console.log('❌ React TSX文件类型检查失败');
    checkResult.errors.forEach(error => {
      console.error(`  - ${error.message}`);
    });
  }
  
  const compileResult = tsl.compile(reactTsxCode);
  if (compileResult.success) {
    console.log('✅ React TSX文件编译成功');
    console.log('编译后的代码:');
    console.log(compileResult.code.substring(0, 500) + '...');
  } else {
    console.log('❌ React TSX文件编译失败');
  }
  
  // 测试普通TypeScript文件
  const tsCode = `
import React from 'react';

// @type number
let count: number = 0;

// @param {number} a
// @param {number} b
// @returns {number}
function add(a: number, b: number): number {
  return a + b;
}

export { count, add };
`;
  
  const tsCheckResult = tsl.check(tsCode);
  if (tsCheckResult.success) {
    console.log('\n✅ TypeScript文件类型检查通过');
  } else {
    console.log('\n❌ TypeScript文件类型检查失败');
    tsCheckResult.errors.forEach(error => {
      console.error(`  - ${error.message}`);
    });
  }
  
  const tsCompileResult = tsl.compile(tsCode);
  if (tsCompileResult.success) {
    console.log('✅ TypeScript文件编译成功');
    console.log('编译后的代码:');
    console.log(tsCompileResult.code.substring(0, 300) + '...');
  } else {
    console.log('❌ TypeScript文件编译失败');
  }
}

// 运行测试
if (require.main === module) {
  testReactPlugin();
}

module.exports = { testReactPlugin };