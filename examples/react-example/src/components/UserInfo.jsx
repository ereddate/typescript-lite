import { useState } from 'react'

// 使用TypeScript Lite类型注解
interface User {
  name: string;
  age: number;
  email: string;
}

interface UserInfoProps {
  user: User;
}

function UserInfo({ user }: UserInfoProps) {
  // 使用TypeScript Lite类型注解
  const [age, setAge] = useState<number>(user.age);

  // 使用TypeScript Lite类型注解定义函数
  function incrementAge(): void {
    setAge(prevAge => prevAge + 1);
  }

  return (
    <div>
      <p><strong>姓名：</strong>{user.name}</p>
      <p><strong>年龄：</strong>{age}</p>
      <p><strong>邮箱：</strong>{user.email}</p>
      <button onClick={incrementAge}>增加年龄</button>
    </div>
  )
}

export default UserInfo