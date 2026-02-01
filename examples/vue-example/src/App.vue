<template>
  <div>
    <h1>Vue + TypeScript Lite 示例</h1>
    <p>欢迎使用 TypeScript Lite 进行类型检查！</p>
    
    <div class="card">
      <h2>用户信息</h2>
      <UserInfo :user="user" />
    </div>
    
    <div class="card">
      <h2>计算示例</h2>
      <Calculator />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UserInfo from './components/UserInfo.vue'
import Calculator from './components/Calculator.vue'

// 使用TypeScript Lite类型注解
interface User {
  name: string;
  age: number;
  email: string;
}

// 类型推断 - 自动推断为User类型
const user = ref({
  name: '张三',
  age: 25,
  email: 'zhangsan@example.com'
});
</script>

<style scoped>
.card {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>