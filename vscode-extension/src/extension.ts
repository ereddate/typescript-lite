import * as vscode from 'vscode';
import { compile, check } from 'typescript-lite';

let diagnosticCollection: vscode.DiagnosticCollection;

/**
 * 激活VS Code插件
 * @param context - 插件上下文
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('TypeScript Lite VS Code插件已激活');
  
  // 创建诊断集合
  diagnosticCollection = vscode.languages.createDiagnosticCollection('typescript-lite');
  
  // 注册事件监听器
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(handleDocumentChange),
    vscode.workspace.onDidOpenTextDocument(handleDocumentOpen),
    vscode.workspace.onDidSaveTextDocument(handleDocumentSave),
    diagnosticCollection
  );
  
  // 检查当前打开的文档
  checkOpenDocuments();
}

/**
 * 停���VS Code插件
 */
export function deactivate() {
  console.log('TypeScript Lite VS Code插件已停用');
  diagnosticCollection.dispose();
}

/**
 * 处理文档变更事件
 * @param event - 文档变更事件
 */
function handleDocumentChange(event: vscode.TextDocumentChangeEvent) {
  if (isSupportedDocument(event.document)) {
    checkDocument(event.document);
  }
}

/**
 * 处理文档打开事件
 * @param document - 打开的文档
 */
function handleDocumentOpen(document: vscode.TextDocument) {
  if (isSupportedDocument(document)) {
    checkDocument(document);
  }
}

/**
 * 处理文档保存事件
 * @param document - 保存的文档
 */
function handleDocumentSave(document: vscode.TextDocument) {
  if (isSupportedDocument(document)) {
    checkDocument(document);
  }
}

/**
 * 检查当前打开的所有文档
 */
function checkOpenDocuments() {
  for (const editor of vscode.window.visibleTextEditors) {
    if (isSupportedDocument(editor.document)) {
      checkDocument(editor.document);
    }
  }
}

/**
 * 检查文档是否支持TypeScript Lite
 * @param document - 要检查的文档
 * @returns 是否支持
 */
function isSupportedDocument(document: vscode.TextDocument): boolean {
  const supportedLanguages = ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'];
  return supportedLanguages.includes(document.languageId);
}

/**
 * 检查文档的类型
 * @param document - 要检查的文档
 */
function checkDocument(document: vscode.TextDocument) {
  const code = document.getText();
  const uri = document.uri;
  
  try {
    // 使用TypeScript Lite进行类型检查
    const result = check(code);
    
    // 清除之前的诊断
    diagnosticCollection.clear();
    
    // 添加新的诊断
    if (!result.success && result.errors.length > 0) {
      const diagnostics: vscode.Diagnostic[] = result.errors.map(error => {
        const range = new vscode.Range(
          error.line - 1, error.column, 
          error.line - 1, error.column + 10
        );
        
        return new vscode.Diagnostic(
          range,
          error.message,
          vscode.DiagnosticSeverity.Error
        );
      });
      
      diagnosticCollection.set(uri, diagnostics);
    }
  } catch (error) {
    console.error('TypeScript Lite类型检查失败:', error);
  }
}
