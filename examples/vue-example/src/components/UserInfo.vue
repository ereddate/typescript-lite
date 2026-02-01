<template>
  <div>
    <p><strong>姓名：</strong>{{ user.name }}</p>
    <p><strong>年龄：</strong>{{ user.age }}</p>
    <p><strong>邮箱：</strong>{{ user.email }}</p>
    <button @click="incrementAge">增加年龄</button>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

// 使用TypeScript Lite类型注解定义props
interface User {
  name: string;
  age: number;
  email: string;
}

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
});

// 使用TypeScript Lite类型注解定义函数
function incrementAge(): void {
  // 注意：在实际Vue 3项目中，需要使用ref或reactive来实现响应式更新
  // 这里只是演示TypeScript Lite的类型检查功能
  console.log('增加年龄');
}
</script>

<style scoped>
button {
  margin-top: 10px;
}
</style>