import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import ParallelCompiler from '../src/parallel-compiler/index.js';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

describe('并行编译器测试', () => {
  let compiler;
  const testFiles = [];
  
  before(async () => {
    compiler = new ParallelCompiler({ maxWorkers: 2 });
    await compiler.initialize();
    
    // 创建测试文件
    for (let i = 0; i < 5; i++) {
      const filePath = join(__dirname, `test-file-${i}.ts`);
      const code = `
let message${i}: string = "Hello ${i}";
let count${i}: number = ${i};
function add${i}(a: number, b: number): number {
  return a + b;
}
`;
      writeFileSync(filePath, code, 'utf8');
      testFiles.push(filePath);
    }
  });
  
  after(async () => {
    await compiler.shutdown();
    
    // 清理测试文件
    testFiles.forEach(filePath => {
      try {
        unlinkSync(filePath);
      } catch (error) {
        // 忽略删除错误
      }
    });
  });
  
  describe('并行编译文件', () => {
    it('应该能够并行编译多个文件', async () => {
      const results = await compiler.compileFiles(testFiles);
      
      expect(results).to.have.lengthOf(testFiles.length);
      results.forEach(result => {
        expect(result.success).to.be.true;
        expect(result.code).to.be.a('string');
      });
    });
    
    it('应该能够处理编译错误', async () => {
      const errorFilePath = join(__dirname, 'error-file.ts');
      const errorCode = 'let x: string = 123;';
      writeFileSync(errorFilePath, errorCode, 'utf8');
      
      const results = await compiler.compileFiles([errorFilePath]);
      
      expect(results).to.have.lengthOf(1);
      expect(results[0].success).to.be.false;
      expect(results[0].errors).to.be.an('array').that.is.not.empty;
      
      unlinkSync(errorFilePath);
    });
  });
  
  describe('并行检查文件', () => {
    it('应该能够并行检查多个文件', async () => {
      const results = await compiler.checkFiles(testFiles);
      
      expect(results).to.have.lengthOf(testFiles.length);
      results.forEach(result => {
        expect(result.success).to.be.true;
        expect(result.errors).to.be.an('array');
      });
    });
    
    it('应该能够检测类型错误', async () => {
      const errorFilePath = join(__dirname, 'type-error-file.ts');
      const errorCode = 'let x: string = 123;';
      writeFileSync(errorFilePath, errorCode, 'utf8');
      
      const results = await compiler.checkFiles([errorFilePath]);
      
      expect(results).to.have.lengthOf(1);
      expect(results[0].success).to.be.false;
      expect(results[0].errors).to.be.an('array').that.is.not.empty;
      
      unlinkSync(errorFilePath);
    });
  });
  
  describe('并行编译代码字符串', () => {
    it('应该能够并行编译多个代码字符串', async () => {
      const codes = [
        'let x: string = "hello";',
        'let y: number = 42;',
        'function add(a: number, b: number): number { return a + b; }'
      ];
      
      const results = await compiler.compileCodes(codes);
      
      expect(results).to.have.lengthOf(codes.length);
      results.forEach(result => {
        expect(result.success).to.be.true;
        expect(result.code).to.be.a('string');
      });
    });
  });
  
  describe('并行检查代码字符串', () => {
    it('应该能够并行检查多个代码字符串', async () => {
      const codes = [
        'let x: string = "hello";',
        'let y: number = 42;',
        'function add(a: number, b: number): number { return a + b; }'
      ];
      
      const results = await compiler.checkCodes(codes);
      
      expect(results).to.have.lengthOf(codes.length);
      results.forEach(result => {
        expect(result.success).to.be.true;
        expect(result.errors).to.be.an('array');
      });
    });
    
    it('应该能够检测代码中的类型错误', async () => {
      const codes = [
        'let x: string = 123;',
        'let y: number = "hello";'
      ];
      
      const results = await compiler.checkCodes(codes);
      
      expect(results).to.have.lengthOf(codes.length);
      results.forEach(result => {
        expect(result.success).to.be.false;
        expect(result.errors).to.be.an('array').that.is.not.empty;
      });
    });
  });
  
  describe('错误处理', () => {
    it('应该能够处理不存在的文件', async () => {
      const results = await compiler.compileFiles(['non-existent-file.ts']);
      
      expect(results).to.have.lengthOf(1);
      expect(results[0].success).to.be.false;
      expect(results[0].error).to.be.a('string');
    });
    
    it('应该能够处理无效的代码', async () => {
      const invalidCode = 'this is not valid javascript';
      
      const results = await compiler.compileCodes([invalidCode]);
      
      expect(results).to.have.lengthOf(1);
      expect(results[0].success).to.be.false;
      expect(results[0].error).to.be.a('string');
    });
  });
  
  describe('性能测试', () => {
    it('并行编译应该比串行编译更快', async () => {
      const codes = Array(10).fill(0).map((_, i) => `
let x${i}: string = "hello";
let y${i}: number = ${i};
function add${i}(a: number, b: number): number {
  return a + b;
}
`);
      
      const startTime = Date.now();
      await compiler.compileCodes(codes);
      const parallelTime = Date.now() - startTime;
      
      // 并行编译应该在合理时间内完成
      expect(parallelTime).to.be.below(5000);
    });
  });
});
