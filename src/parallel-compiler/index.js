import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Worker 线程池配置
const WORKER_CONFIG = {
  MAX_WORKERS: 4, // 最大 Worker 数量
  TASK_TIMEOUT: 30000, // 任务超时时间（毫秒）
  RETRY_ATTEMPTS: 3, // 重试次数
  RETRY_DELAY: 1000 // 重试延迟（毫秒）
};

// Worker 任务队列
class WorkerPool {
  constructor(maxWorkers = WORKER_CONFIG.MAX_WORKERS) {
    this.maxWorkers = maxWorkers;
    this.workers = [];
    this.taskQueue = [];
    this.activeTasks = new Map();
    this.taskIdCounter = 0;
  }

  /**
   * 初始化 Worker 线程池
   */
  async initialize() {
    const workerScript = join(__dirname, 'worker.js');
    
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker(workerScript);
      this.workers.push({
        id: i,
        worker: worker,
        busy: false,
        taskId: null
      });
      
      worker.on('error', (error) => {
        console.error(`Worker ${i} 错误:`, error);
        this.handleWorkerError(i, error);
      });
      
      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error(`Worker ${i} 异常退出，退出码: ${code}`);
          this.restartWorker(i);
        }
      });
    }
  }

  /**
   * 处理 Worker 错误
   */
  handleWorkerError(workerId, error) {
    const workerInfo = this.workers[workerId];
    if (workerInfo && workerInfo.taskId !== null) {
      const task = this.activeTasks.get(workerInfo.taskId);
      if (task) {
        task.reject(error);
        this.activeTasks.delete(workerInfo.taskId);
      }
      workerInfo.busy = false;
      workerInfo.taskId = null;
    }
  }

  /**
   * 重启 Worker
   */
  async restartWorker(workerId) {
    const workerScript = join(__dirname, 'worker.js');
    const worker = new Worker(workerScript);
    
    this.workers[workerId] = {
      id: workerId,
      worker: worker,
      busy: false,
      taskId: null
    };
    
    worker.on('error', (error) => {
      console.error(`Worker ${workerId} 错误:`, error);
      this.handleWorkerError(workerId, error);
    });
    
    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker ${workerId} 异常退出，退出码: ${code}`);
        this.restartWorker(workerId);
      }
    });
  }

  /**
   * 获取空闲 Worker
   */
  getAvailableWorker() {
    return this.workers.find(w => !w.busy);
  }

  /**
   * 执行任务
   */
  async executeTask(task) {
    return new Promise((resolve, reject) => {
      const taskId = this.taskIdCounter++;
      this.taskQueue.push({
        id: taskId,
        task,
        resolve,
        reject,
        attempts: 0
      });
      this.processQueue();
    });
  }

  /**
   * 处理任务队列
   */
  processQueue() {
    while (this.taskQueue.length > 0) {
      const worker = this.getAvailableWorker();
      if (!worker) break;
      
      const taskItem = this.taskQueue.shift();
      this.assignTaskToWorker(worker, taskItem);
    }
  }

  /**
   * 分配任务给 Worker
   */
  assignTaskToWorker(worker, taskItem) {
    worker.busy = true;
    worker.taskId = taskItem.id;
    this.activeTasks.set(taskItem.id, taskItem);
    
    const timeout = setTimeout(() => {
      if (this.activeTasks.has(taskItem.id)) {
        this.handleTaskTimeout(worker, taskItem);
      }
    }, WORKER_CONFIG.TASK_TIMEOUT);
    
    const handleMessage = (result) => {
      clearTimeout(timeout);
      worker.worker.off('message', handleMessage);
      
      if (result.taskId === taskItem.id) {
        worker.busy = false;
        worker.taskId = null;
        this.activeTasks.delete(taskItem.id);
        
        if (result.success) {
          taskItem.resolve(result.data);
        } else {
          taskItem.reject(new Error(result.error));
        }
        
        this.processQueue();
      }
    };
    
    worker.worker.on('message', handleMessage);
    worker.worker.postMessage({
      taskId: taskItem.id,
      type: taskItem.task.type,
      data: taskItem.task.data
    });
  }

  /**
   * 处理任务超时
   */
  handleTaskTimeout(worker, taskItem) {
    console.error(`任务 ${taskItem.id} 超时`);
    worker.busy = false;
    worker.taskId = null;
    this.activeTasks.delete(taskItem.id);
    
    if (taskItem.attempts < WORKER_CONFIG.RETRY_ATTEMPTS) {
      taskItem.attempts++;
      this.taskQueue.unshift(taskItem);
      this.processQueue();
    } else {
      taskItem.reject(new Error(`任务超时，已重试 ${WORKER_CONFIG.RETRY_ATTEMPTS} 次`));
    }
  }

  /**
   * 关闭所有 Worker
   */
  async shutdown() {
    const shutdownPromises = this.workers.map(w => {
      return new Promise((resolve) => {
        w.worker.terminate().then(resolve).catch(resolve);
      });
    });
    
    await Promise.all(shutdownPromises);
    this.workers = [];
    this.taskQueue = [];
    this.activeTasks.clear();
  }
}

// 并行编译器
class ParallelCompiler {
  constructor(options = {}) {
    this.maxWorkers = options.maxWorkers || WORKER_CONFIG.MAX_WORKERS;
    this.workerPool = new WorkerPool(this.maxWorkers);
    this.initialized = false;
  }

  /**
   * 初始化编译器
   */
  async initialize() {
    if (!this.initialized) {
      await this.workerPool.initialize();
      this.initialized = true;
    }
  }

  /**
   * 并行编译多个文件
   */
  async compileFiles(filePaths, options = {}) {
    await this.initialize();
    
    const tasks = filePaths.map(filePath => {
      return {
        type: 'compile',
        data: {
          filePath,
          options
        }
      };
    });
    
    const results = await Promise.allSettled(
      tasks.map(task => this.workerPool.executeTask(task))
    );
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return {
          filePath: filePaths[index],
          success: true,
          ...result.value
        };
      } else {
        return {
          filePath: filePaths[index],
          success: false,
          error: result.reason.message
        };
      }
    });
  }

  /**
   * 并行检查多个文件
   */
  async checkFiles(filePaths, options = {}) {
    await this.initialize();
    
    const tasks = filePaths.map(filePath => {
      return {
        type: 'check',
        data: {
          filePath,
          options
        }
      };
    });
    
    const results = await Promise.allSettled(
      tasks.map(task => this.workerPool.executeTask(task))
    );
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return {
          filePath: filePaths[index],
          success: true,
          ...result.value
        };
      } else {
        return {
          filePath: filePaths[index],
          success: false,
          error: result.reason.message
        };
      }
    });
  }

  /**
   * 并行编译代码字符串
   */
  async compileCodes(codes, options = {}) {
    await this.initialize();
    
    const tasks = codes.map(code => {
      return {
        type: 'compileCode',
        data: {
          code,
          options
        }
      };
    });
    
    const results = await Promise.allSettled(
      tasks.map(task => this.workerPool.executeTask(task))
    );
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return {
          success: true,
          ...result.value
        };
      } else {
        return {
          success: false,
          error: result.reason.message
        };
      }
    });
  }

  /**
   * 并行检查代码字符串
   */
  async checkCodes(codes, options = {}) {
    await this.initialize();
    
    const tasks = codes.map(code => {
      return {
        type: 'checkCode',
        data: {
          code,
          options
        }
      };
    });
    
    const results = await Promise.allSettled(
      tasks.map(task => this.workerPool.executeTask(task))
    );
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return {
          success: true,
          ...result.value
        };
      } else {
        return {
          success: false,
          error: result.reason.message
        };
      }
    });
  }

  /**
   * 关闭编译器
   */
  async shutdown() {
    await this.workerPool.shutdown();
    this.initialized = false;
  }
}

// 导出并行编译器
export {
  ParallelCompiler,
  WorkerPool,
  WORKER_CONFIG
};

export default ParallelCompiler;
