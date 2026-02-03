import { parentPort, workerData } from 'worker_threads';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 动态导入主模块
async function getTslModule() {
  const tslPath = join(__dirname, '../index.js');
  const tsl = await import(tslPath);
  return tsl;
}

// 处理编译文件任务
async function handleCompileFile(data) {
  const { filePath, options } = data;
  const tsl = await getTslModule();
  
  try {
    const code = readFileSync(filePath, 'utf8');
    const result = tsl.compile(code, options);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// 处理检查文件任务
async function handleCheckFile(data) {
  const { filePath, options } = data;
  const tsl = await getTslModule();
  
  try {
    const code = readFileSync(filePath, 'utf8');
    const result = tsl.check(code, options);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// 处理编译代码任务
async function handleCompileCode(data) {
  const { code, options } = data;
  const tsl = await getTslModule();
  
  try {
    const result = tsl.compile(code, options);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// 处理检查代码任务
async function handleCheckCode(data) {
  const { code, options } = data;
  const tsl = await getTslModule();
  
  try {
    const result = tsl.check(code, options);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// 任务处理器映射
const taskHandlers = {
  compile: handleCompileFile,
  check: handleCheckFile,
  compileCode: handleCompileCode,
  checkCode: handleCheckCode
};

// 监听主线程消息
parentPort.on('message', async (message) => {
  const { taskId, type, data } = message;
  
  try {
    const handler = taskHandlers[type];
    if (!handler) {
      throw new Error(`未知的任务类型: ${type}`);
    }
    
    const result = await handler(data);
    
    parentPort.postMessage({
      taskId,
      ...result
    });
  } catch (error) {
    parentPort.postMessage({
      taskId,
      success: false,
      error: error.message
    });
  }
});

// 监听错误
process.on('uncaughtException', (error) => {
  console.error('Worker 未捕获异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Worker 未处理的 Promise 拒绝:', reason);
  process.exit(1);
});
