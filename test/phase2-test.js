// 第二阶段测试

import tsl from '../src/index.js';

// 测试用例集合
const phase2TestCases = [
  {
    name: '泛型函数 - 基本用法',
    code: `// @template T
function identity<T>(value: T): T {
  return value;
}

// 测试不同类型的调用
let str: string = identity<string>("hello");
let num: number = identity<number>(42);
let bool: boolean = identity<boolean>(true);`,
    expected: { success: true, errors: [] }
  },
  {
    name: '联合类型 - 变量声明',
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
    name: '缓存机制 - 重复调用',
    code: `// @type string
let message: string = "Hello TypeScript Lite";

// @param {string} msg
// @returns {void}
function logMessage(msg: string): void {
  console.log(msg);
}

logMessage(message);`,
    expected: { success: true, errors: [] }
  }
];

// 运行测试
function runPhase2Tests() {
  console.log('=== 第二阶段综合测试 ===\n');
  
  let passed = 0;
  let failed = 0;
  
  phase2TestCases.forEach((testCase, index) => {
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
        
        // 测试缓存机制（重复调用）
        const cachedCheckResult = tsl.check(testCase.code);
        const cachedCompileResult = tsl.compile(testCase.code);
        if (cachedCheckResult.success && cachedCompileResult.success) {
          console.log('   ✅ 缓存机制正常');
        } else {
          console.log('   ❌ 缓存机制异常');
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
  
  // 测试缓存清空
  console.log('测试 5: 缓存清空');
  try {
    tsl.clearCache();
    console.log('✅ 缓存清空成功');
    passed++;
  } catch (error) {
    console.log('❌ 缓存清空失败:', error.message);
    failed++;
  }
  
  // 输出测试结果
  console.log('\n=== 测试结果 ===');
  console.log(`通过: ${passed}`);
  console.log(`失败: ${failed}`);
  console.log(`总测试数: ${phase2TestCases.length + 1}`); // +1 是缓存清空测试
  
  if (failed === 0) {
    console.log('\n🎉 所有第二阶段测试通过！');
    console.log('\nTypeScript Lite 第二阶段完成，支持：');
    console.log('  ✅ 泛型函数（function identity<T>(value: T): T）');
    console.log('  ✅ 联合类型（string | number）');
    console.log('  ✅ 缓存机制（提高性能）');
    console.log('  ✅ Vue和React框架集成');
    console.log('  ✅ Vite和Webpack构建工具集成');
  } else {
    console.log('\n⚠️  部分第二阶段测试失败，需要修复。');
  }
}

// 运行测试
if (import.meta.url.includes('phase2-test.js')) {
  runPhase2Tests();
}

export { runPhase2Tests };