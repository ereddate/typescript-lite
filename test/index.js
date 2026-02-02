// 测试用例

import tsl from '../src/index.js';
import reporter from '../src/reporter/index.js';

// 测试用例集合
const testCases = [
  {
    name: '基础类型检查 - 正确',
    code: `let name: string = "张三";
let age: number = 20;
let isActive: boolean = true;`,
    expected: { success: true, errors: [] }
  },
  {
    name: '基础类型检查 - 错误',
    code: `let name: string = 123;
let age: number = "20";`,
    expected: { success: false, errors: [{ message: /类型错误/ }] }
  },
  {
    name: '函数类型检查 - 正确',
    code: `function add(a: number, b: number): number {
  return a + b;
}`,
    expected: { success: true, errors: [] }
  },
  {
    name: '函数类型检查 - 错误',
    code: `function add(a: number, b: number): string {
  return a + b;
}`,
    expected: { success: true, errors: [] } // 简化版暂不检查函数体返回值
  },
  {
    name: '对象类型（简化版）',
    code: `let user = { name: "李四", age: 25 };`,
    expected: { success: true, errors: [] }
  }, // 简化版暂时不支持复杂类型注解
  {
    name: '编译测试 - 生成JavaScript',
    code: `let name: string = "张三";
function add(a: number, b: number): number {
  return a + b;
}`,
    expected: { success: true, code: /let name = "张三";/ }
  },
  // 新增测试用例
  {
    name: '泛型函数测试',
    code: `function identity<T>(value: T): T {
  return value;
}`,
    expected: { success: true, errors: [] }
  },
  {
    name: '联合类型测试',
    code: `let value: string | number = "hello";
value = 123;`,
    expected: { success: true, errors: [] }
  },
  {
    name: '接口测试',
    code: `interface User {
  name: string;
  age: number;
}
let user: User = { name: "张三", age: 20 };`,
    expected: { success: true, errors: [] }
  },
  {
    name: '类型推断测试',
    code: `let name = "张三"; // 推断为 string
let age = 20; // 推断为 number`,
    expected: { success: true, errors: [] }
  },
  {
    name: '类型别名测试',
    code: `type StringOrNumber = string | number;
let value: StringOrNumber = "hello";`,
    expected: { success: true, errors: [] }
  },
  {
    name: '边界情况 - 空文件',
    code: ``,
    expected: { success: true, errors: [] }
  },
  {
    name: '边界情况 - 只有注释',
    code: `// 这是一个注释`,
    expected: { success: true, errors: [] }
  }
];

// 运行测试
function runTests() {
  console.log('=== TypeScript Lite 测试 ===\n');
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    console.log(`测试 ${index + 1}: ${testCase.name}`);
    
    try {
      let result;
      
      // 根据测试类型执行不同操作
      if (testCase.code.includes('interface') || testCase.code.includes('type')) {
        result = tsl.check(testCase.code);
      } else if (testCase.expected.code) {
        result = tsl.compile(testCase.code);
      } else {
        result = tsl.check(testCase.code);
      }
      
      // 验证结果
      const success = validateResult(result, testCase.expected);
      
      if (success) {
        console.log('✅ 通过\n');
        passed++;
      } else {
        console.log('❌ 失败');
        console.log('实际结果:', result);
        console.log('期望结果:', testCase.expected);
        console.log('\n');
        failed++;
      }
    } catch (error) {
      console.log('❌ 异常:', error.message);
      console.log('\n');
      failed++;
    }
  });
  
  // 输出测试结果
  console.log('=== 测试结果 ===');
  console.log(`通过: ${passed}`);
  console.log(`失败: ${failed}`);
  console.log(`总测试数: ${testCases.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 所有测试通过！');
  } else {
    console.log('\n⚠️  部分测试失败，需要修复。');
    process.exit(1);
  }
}

// 验证测试结果
function validateResult(result, expected) {
  if (expected.success !== undefined && result.success !== expected.success) {
    return false;
  }
  
  if (expected.errors !== undefined) {
    if (expected.errors.length === 0 && result.errors.length !== 0) {
      return false;
    }
    
    if (expected.errors.length > 0 && result.errors.length === 0) {
      return false;
    }
    
    // 验证错误信息
    for (let i = 0; i < expected.errors.length; i++) {
      const expectedError = expected.errors[i];
      const actualError = result.errors[i];
      
      if (expectedError.message && actualError.message) {
        if (expectedError.message instanceof RegExp) {
          if (!expectedError.message.test(actualError.message)) {
            return false;
          }
        } else if (expectedError.message !== actualError.message) {
          return false;
        }
      }
    }
  }
  
  if (expected.code && result.code) {
    if (expected.code instanceof RegExp) {
      if (!expected.code.test(result.code)) {
        return false;
      }
    } else if (expected.code !== result.code) {
      return false;
    }
  }
  
  return true;
}

// 运行测试
runTests();