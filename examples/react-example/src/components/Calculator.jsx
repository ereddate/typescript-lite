import { useState } from 'react'

function Calculator() {
  // 使用TypeScript Lite类型注解
  const [num1, setNum1] = useState<number>(0);
  const [num2, setNum2] = useState<number>(0);
  const [result, setResult] = useState<number | string>('');

  // 使用TypeScript Lite类型注解定义函数
  function add(): void {
    const n1 = Number(num1);
    const n2 = Number(num2);
    setResult(calculate<number>('add', n1, n2));
  }

  function subtract(): void {
    const n1 = Number(num1);
    const n2 = Number(num2);
    setResult(calculate<number>('subtract', n1, n2));
  }

  // 使用TypeScript Lite泛型函数
  function calculate<T>(operation: string, a: T, b: T): T {
    if (operation === 'add') {
      return (a + b) as unknown as T;
    } else if (operation === 'subtract') {
      return (a - b) as unknown as T;
    }
    return a;
  }

  return (
    <div>
      <input 
        type="number" 
        placeholder="请输入第一个数字"
        value={num1}
        onChange={(e) => setNum1(Number(e.target.value))}
      />
      <input 
        type="number" 
        placeholder="请输入第二个数字"
        value={num2}
        onChange={(e) => setNum2(Number(e.target.value))}
      />
      <button onClick={add}>相加</button>
      <button onClick={subtract}>相减</button>
      <p>结果：{result}</p>
    </div>
  )
}

export default Calculator