// Vue集成测试用例

const tsl = require('../src/index');

// 测试Vue单文件组件
const vueComponent = `
<template>
  <div>
    <h1>{{ message }}</h1>
    <p>{{ count }}</p>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    // @type string
    let message: string = 'Hello TypeScript Lite';
    // @type number
    let count: number = 0;
    return {
      message,
      count
    };
  },
  methods: {
    // @param {number} increment
    // @returns {void}
    increment: function(increment: number): void {
      this.count += increment;
    }
  }
};
</script>

<style scoped>
h1 {
  color: #42b983;
}
</style>
`;

// 测试Vue插件
function testVuePlugin() {
  console.log('=== Vue 集成测试 ===\n');
  
  // 提取Vue组件中的<script>标签内容
  const scriptMatch = vueComponent.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    const scriptContent = scriptMatch[1];
    
    // 测试<script>标签内容
    const checkResult = tsl.check(scriptContent);
    if (checkResult.success) {
      console.log('✅ Vue组件类型检查通过');
    } else {
      console.log('❌ Vue组件类型检查失败');
      checkResult.errors.forEach(error => {
        console.error(`  - ${error.message}`);
      });
    }
    
    const compileResult = tsl.compile(scriptContent);
    if (compileResult.success) {
      console.log('✅ Vue组件编译成功');
      console.log('编译后的代码:');
      console.log(compileResult.code.substring(0, 500) + '...');
    } else {
      console.log('❌ Vue组件编译失败');
    }
  } else {
    console.log('❌ 未找到Vue组件中的<script>标签');
  }
  
  // 测试普通TypeScript文件
  const tsCode = `
import Vue from 'vue';

// @type string
let name: string = 'Vue Test';

// @param {string} message
// @returns {void}
function logMessage(message: string): void {
  console.log(message);
}

export { name, logMessage };
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
  testVuePlugin();
}

module.exports = { testVuePlugin };