// 联合类型和交叉类型测试

import tsl from '../src/index.js';

// 测试用例集合
const unionIntersectionTestCases = [
  {
    name: '联合类型 - 正确',
    code: `// @type string | number
let value: string | number = "hello";
value = 42; // 应该通过，因为42是number类型`,
    expected: { success: true, errors: [] }
  },
  {
    name: '联合类型 - 函数参数',
    code: `// @param {string | number} value
// @returns {string}
function formatValue(value: string | number): string {
  return String(value);
}

// 测试不同类型的调用
const result1 = formatValue("test");
const result2 = formatValue(42);`,
    expected: { success: true, errors: [] }
  },
  {
    name: '联合类型 - 函数返回值',
    code: `// @param {boolean} flag
// @returns {string | number}
function getValue(flag: boolean): string | number {
  return flag ? "hello" : 42;
}

const result = getValue(true);`,
    expected: { success: true, errors: [] }
  },
  {
    name: '交叉类型 - 简化版',
    code: `// 交叉类型示例
// @type { name: string } & { age: number }
let user: { name: string } & { age: number } = { name: "张三", age: 20 };`,
    expected: { success: true, errors: [] }
  }
];

// 运行测试
function runUnionIntersectionTests() {
  console.log('=== 联合类型和交叉类型测试 ===\n');
  
  let passed = 0;
  let failed = 0;
  
  unionIntersectionTestCases.forEach((testCase, index) => {
    console.log(`测试 ${index + 1}: ${testCase.name}`);
    
    try {
      // 检查类型
      const checkResult = tsl.check(testCase.code);
      
      // 验证结果
      const success = checkResult.success === testCase.expected.success;
      
      if (success) {
        console.log('✅ 通过');
        
        // 测试编译
        const compileResult = tsl.compile(testCase.code);
        if (compileResult.success) {
          console.log('   编译成功:');
          console.log('   ' + compileResult.code.substring(0, 200) + '...');
        } else {
          console.log('   ❌ 编译失败');
        }
      } else {
        console.log('❌ 失败');
        console.log('实际结果:', checkResult);
        console.log('期望结果:', testCase.expected);
        failed++;
      }
    } catch (error) {
      console.log('❌ 异常:', error.message);
      failed++;
    }
    
    console.log('\n');
  });
  
  // 输出测试结果
  console.log('=== 测试结果 ===');
  console.log(`通过: ${passed}`);
  console.log(`失败: ${failed}`);
  console.log(`总测试数: ${unionIntersectionTestCases.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 所有联合类型和交叉类型测试通过！');
  } else {
    console.log('\n⚠️  部分测试失败，需要修复。');
  }
}

// 运行测试
if (import.meta.url.includes('union-intersection-test.js')) {
  runUnionIntersectionTests();
}

export { runUnionIntersectionTests };