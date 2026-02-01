import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vitePlugin as tslVitePlugin } from '../../plugins/tsl-vite-plugin/index.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tslVitePlugin({
      // 配置选项
      enableIncremental: true,  // 启用增量编译
      debug: false              // 启用调试模式
    })
  ]
})