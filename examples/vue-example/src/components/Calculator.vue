<template>
  <div>
    <input v-model="num1" type="number" placeholder="请输入第一个数字" />
    <input v-model="num2" type="number" placeholder="请输入第二个数字" />
    <button @click="add">相加</button>
    <button @click="subtract">相减</button>
    <p>结果：{{ result }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 使用TypeScript Lite类型注解
const num1 = ref<number>(0);
const num2 = ref<number>(0);
const result = ref<number | string>('');

// 使用TypeScript Lite类型注解定义函数
function add(): void {
  const n1 = Number(num1.value);
  const n2 = Number(num2.value);
  result.value = calculate<number>('add', n1, n2);
}

function subtract(): void {
  const n1 = Number(num1.value);
  const n2 = Number(num2.value);
  result.value = calculate<number>('subtract', n1, n2);
}

// 使用TypeScript Lite泛型函数
function calculate<T>(operation: string, a: T, b: T): T {
  if (operation === 'add') {
    return (a as number) + (b as number) as unknown as T;
  } else if (operation === 'subtract') {
    return (a as number) - (b as number) as unknown as T;
  }
  return a;
}
</script>

<style scoped>
input {
  margin: 0 10px;
  padding: 5px;
}

button {
  margin: 0 5px;
}

p {
  margin-top: 10px;
  font-weight: bold;
}
</style>