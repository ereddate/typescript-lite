import { useState } from 'react'
import UserInfo from './components/UserInfo.jsx'
import Calculator from './components/Calculator.jsx'
import './App.css'

// 使用TypeScript Lite类型注解
interface User {
  name: string;
  age: number;
  email: string;
}

function App() {
  // 使用TypeScript Lite类型注解
  const [user, setUser] = useState<User>({
    name: '张三',
    age: 25,
    email: 'zhangsan@example.com'
  });

  return (
    <div className="App">
      <h1>React + TypeScript Lite 示例</h1>
      <p>欢迎使用 TypeScript Lite 进行类型检查！</p>
      
      <div className="card">
        <h2>用户信息</h2>
        <UserInfo user={user} />
      </div>
      
      <div className="card">
        <h2>计算示例</h2>
        <Calculator />
      </div>
    </div>
  )
}

export default App