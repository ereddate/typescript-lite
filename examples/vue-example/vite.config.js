import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { vitePlugin as tslVitePlugin } from '../../plugins/tsl-vite-plugin/index.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tslVitePlugin({
      // 配置选项
      enableIncremental: true,  // 启用增量编译
      debug: false              // 启用调试模式
    })
  ]
})