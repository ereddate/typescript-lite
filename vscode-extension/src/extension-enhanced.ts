import * as vscode from 'vscode';
import { compile, check, clearCache } from 'typescript-lite';
import { ErrorHandler, ERROR_CODES } from 'typescript-lite/src/error-handler/index.js';

let diagnosticCollection: vscode.DiagnosticCollection;
let errorHandler: ErrorHandler;
let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;

// 配置选项
interface TslConfig {
  enable: boolean;
  debug: boolean;
  autoCheck: boolean;
  checkOnSave: boolean;
  checkOnType: boolean;
  showStatusBar: boolean;
  maxErrors: number;
  maxWarnings: number;
}

// 默认配置
const defaultConfig: TslConfig = {
  enable: true,
  debug: false,
  autoCheck: true,
  checkOnSave: true,
  checkOnType: true,
  showStatusBar: true,
  maxErrors: 100,
  maxWarnings: 100
};

let currentConfig: TslConfig = { ...defaultConfig };

/**
 * 激活 VS Code 插件
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('TypeScript Lite VS Code 插件已激活');
  
  // 初始化错误处理器
  errorHandler = new ErrorHandler({
    maxErrors: currentConfig.maxErrors,
    maxWarnings: currentConfig.maxWarnings
  });
  
  // 创建诊断集合
  diagnosticCollection = vscode.languages.createDiagnosticCollection('typescript-lite');
  
  // 创建输出通道
  outputChannel = vscode.window.createOutputChannel('TypeScript Lite');
  
  // 创建状态栏项
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = 'tsl.showOutput';
  statusBarItem.show();
  
  // 加载配置
  loadConfiguration();
  
  // 注册配置变更监听
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(handleConfigurationChange)
  );
  
  // 注册事件监听器
  const documentChangeDisposable = vscode.workspace.onDidChangeTextDocument(
    handleDocumentChange,
    null,
    context.subscriptions
  );
  
  const documentOpenDisposable = vscode.workspace.onDidOpenTextDocument(
    handleDocumentOpen,
    null,
    context.subscriptions
  );
  
  const documentSaveDisposable = vscode.workspace.onDidSaveTextDocument(
    handleDocumentSave,
    null,
    context.subscriptions
  );
  
  // 注册命令
  const checkCommand = vscode.commands.registerCommand(
    'tsl.check',
    checkCurrentDocument
  );
  
  const clearCacheCommand = vscode.commands.registerCommand(
    'tsl.clearCache',
    clearTslCache
  );
  
  const showOutputCommand = vscode.commands.registerCommand(
    'tsl.showOutput',
    () => outputChannel.show()
  );
  
  const quickFixCommand = vscode.commands.registerCommand(
    'tsl.quickFix',
    handleQuickFix
  );
  
  // 注册代码完成提供者
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
    new TslCompletionProvider(),
    '.'
  );
  
  // 注册代码操作提供者
  const codeActionProvider = vscode.languages.registerCodeActionsProvider(
    ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
    new TslCodeActionProvider()
  );
  
  // 注册悬停提示提供者
  const hoverProvider = vscode.languages.registerHoverProvider(
    ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
    new TslHoverProvider()
  );
  
  // 添加到订阅列表
  context.subscriptions.push(
    documentChangeDisposable,
    documentOpenDisposable,
    documentSaveDisposable,
    checkCommand,
    clearCacheCommand,
    showOutputCommand,
    quickFixCommand,
    completionProvider,
    codeActionProvider,
    hoverProvider,
    diagnosticCollection,
    statusBarItem,
    outputChannel
  );
  
  // 检查当前打开的文档
  checkOpenDocuments();
}

/**
 * 停用 VS Code 插件
 */
export function deactivate() {
  console.log('TypeScript Lite VS Code 插件已停用');
  diagnosticCollection.dispose();
  statusBarItem.dispose();
  outputChannel.dispose();
}

/**
 * 加载配置
 */
function loadConfiguration() {
  const config = vscode.workspace.getConfiguration('typescript-lite');
  
  currentConfig = {
    enable: config.get('enable', defaultConfig.enable),
    debug: config.get('debug', defaultConfig.debug),
    autoCheck: config.get('autoCheck', defaultConfig.autoCheck),
    checkOnSave: config.get('checkOnSave', defaultConfig.checkOnSave),
    checkOnType: config.get('checkOnType', defaultConfig.checkOnType),
    showStatusBar: config.get('showStatusBar', defaultConfig.showStatusBar),
    maxErrors: config.get('maxErrors', defaultConfig.maxErrors),
    maxWarnings: config.get('maxWarnings', defaultConfig.maxWarnings)
  };
  
  if (currentConfig.debug) {
    outputChannel.appendLine('配置已加载:');
    outputChannel.appendLine(JSON.stringify(currentConfig, null, 2));
  }
}

/**
 * 处理配置变更
 */
function handleConfigurationChange(event: vscode.ConfigurationChangeEvent) {
  if (event.affectsConfiguration('typescript-lite')) {
    loadConfiguration();
    outputChannel.appendLine('配置已更新');
  }
}

/**
 * 处理文档变更事件
 */
function handleDocumentChange(event: vscode.TextDocumentChangeEvent) {
  if (!currentConfig.enable || !currentConfig.autoCheck) return;
  if (!currentConfig.checkOnType) return;
  if (!isSupportedDocument(event.document)) return;
  
  // 防抖处理
  debouncedCheck(event.document);
}

/**
 * 处理文档打开事件
 */
function handleDocumentOpen(document: vscode.TextDocument) {
  if (!currentConfig.enable || !currentConfig.autoCheck) return;
  if (!isSupportedDocument(document)) return;
  
  checkDocument(document);
}

/**
 * 处理文档保存事件
 */
function handleDocumentSave(document: vscode.TextDocument) {
  if (!currentConfig.enable || !currentConfig.autoCheck) return;
  if (!currentConfig.checkOnSave) return;
  if (!isSupportedDocument(document)) return;
  
  checkDocument(document);
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
 * 检查当前文档
 */
function checkCurrentDocument() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  
  checkDocument(editor.document);
}

/**
 * 清空缓存
 */
function clearTslCache() {
  clearCache();
  outputChannel.appendLine('缓存已清空');
  vscode.window.showInformationMessage('TypeScript Lite 缓存已清空');
}

/**
 * 处理快速修复
 */
function handleQuickFix(uri: vscode.Uri, range: vscode.Range) {
  const document = vscode.workspace.textDocuments.find(doc => doc.uri.toString() === uri.toString());
  if (!document) return;
  
  const diagnostics = diagnosticCollection.get(uri);
  if (!diagnostics) return;
  
  const diagnostic = diagnostics.find(d => d.range.contains(range));
  if (!diagnostic) return;
  
  // 显示修复建议
  const fixes = getFixSuggestions(diagnostic);
  if (fixes.length > 0) {
    vscode.window.showQuickPick(fixes, {
      placeHolder: '选择修复方案'
    }).then(selected => {
      if (selected) {
        applyFix(document, range, selected.fix);
      }
    });
  }
}

/**
 * 获取修复建议
 */
function getFixSuggestions(diagnostic: vscode.Diagnostic): FixSuggestion[] {
  const suggestions: FixSuggestion[] = [];
  
  // 根据错误代码提供不同的修复建议
  if (diagnostic.code === ERROR_CODES.TYPE_MISMATCH) {
    suggestions.push({
      label: '修改变量类型',
      description: '将变量类型改为实际类型',
      fix: 'change-type'
    });
    suggestions.push({
      label: '修改赋值',
      description: '将赋值改为期望的类型',
      fix: 'change-value'
    });
  }
  
  return suggestions;
}

/**
 * 应用修复
 */
function applyFix(document: vscode.TextDocument, range: vscode.Range, fix: string) {
  const edit = new vscode.WorkspaceEdit();
  
  switch (fix) {
    case 'change-type':
      // 实现类型修改逻辑
      break;
    case 'change-value':
      // 实现值修改逻辑
      break;
  }
  
  vscode.workspace.applyEdit(edit);
}

/**
 * 检查文档是否支持 TypeScript Lite
 */
function isSupportedDocument(document: vscode.TextDocument): boolean {
  const supportedLanguages = ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'];
  return supportedLanguages.includes(document.languageId);
}

/**
 * 检查文档的类型
 */
function checkDocument(document: vscode.TextDocument) {
  const code = document.getText();
  const uri = document.uri;
  
  try {
    if (currentConfig.debug) {
      outputChannel.appendLine(`检查文档: ${uri.fsPath}`);
    }
    
    // 使用 TypeScript Lite 进行类型检查
    const result = check(code);
    
    // 清空错误处理器
    errorHandler.clear();
    
    // 添加错误
    if (!result.success && result.errors.length > 0) {
      result.errors.forEach(error => {
        errorHandler.addError(error);
      });
    }
    
    // 添加上下文
    errorHandler.addContextToErrors(code);
    
    // 清除之前的诊断
    diagnosticCollection.clear();
    
    // 添加新的诊断
    const diagnostics: vscode.Diagnostic[] = [];
    
    errorHandler.errors.forEach(error => {
      const range = new vscode.Range(
        error.line - 1, error.column,
        error.line - 1, error.column + 10
      );
      
      const diagnostic = new vscode.Diagnostic(
        range,
        error.message,
        vscode.DiagnosticSeverity.Error
      );
      
      diagnostic.code = error.code;
      diagnostic.source = 'TypeScript Lite';
      
      // 添加相关代码
      if (error.context) {
        diagnostic.relatedInformation = [
          new vscode.DiagnosticRelatedInformation(
            new vscode.Location(
              uri,
              range
            ),
            error.context
          )
        ];
      }
      
      diagnostics.push(diagnostic);
    });
    
    errorHandler.warnings.forEach(warning => {
      const range = new vscode.Range(
        warning.line - 1, warning.column,
        warning.line - 1, warning.column + 10
      );
      
      const diagnostic = new vscode.Diagnostic(
        range,
        warning.message,
        vscode.DiagnosticSeverity.Warning
      );
      
      diagnostic.code = warning.code;
      diagnostic.source = 'TypeScript Lite';
      
      diagnostics.push(diagnostic);
    });
    
    diagnosticCollection.set(uri, diagnostics);
    
    // 更新状态栏
    updateStatusBar(errorHandler.errors.length, errorHandler.warnings.length);
    
    if (currentConfig.debug) {
      outputChannel.appendLine(`检查完成: ${errorHandler.errors.length} 错误, ${errorHandler.warnings.length} 警告`);
    }
  } catch (error) {
    console.error('TypeScript Lite 类型检查失败:', error);
    outputChannel.appendLine(`错误: ${error.message}`);
  }
}

/**
 * 更新状态栏
 */
function updateStatusBar(errorCount: number, warningCount: number) {
  if (!currentConfig.showStatusBar) {
    statusBarItem.hide();
    return;
  }
  
  statusBarItem.show();
  
  if (errorCount === 0 && warningCount === 0) {
    statusBarItem.text = '$(check) TypeScript Lite';
    statusBarItem.tooltip = '没有错误或警告';
    statusBarItem.color = undefined;
  } else {
    const errorText = errorCount > 0 ? `${errorCount} 错误` : '';
    const warningText = warningCount > 0 ? `${warningCount} 警告` : '';
    const text = [errorText, warningText].filter(Boolean).join(', ');
    
    statusBarItem.text = `$(error) ${text}`;
    statusBarItem.tooltip = `TypeScript Lite: ${text}`;
    statusBarItem.color = errorCount > 0 ? '#ff0000' : '#ffcc00';
  }
}

/**
 * 防抖函数
 */
let debounceTimer: NodeJS.Timeout | undefined;
function debouncedCheck(document: vscode.TextDocument) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  debounceTimer = setTimeout(() => {
    checkDocument(document);
  }, 500);
}

/**
 * TypeScript Lite 代码完成提供者
 */
class TslCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const items: vscode.CompletionItem[] = [];
    
    // 添加类型注解建议
    const line = document.lineAt(position).text;
    const beforeCursor = line.substring(0, position.character);
    
    if (beforeCursor.match(/:\s*$/)) {
      items.push(
        new vscode.CompletionItem('string', vscode.CompletionItemKind.TypeParameter),
        new vscode.CompletionItem('number', vscode.CompletionItemKind.TypeParameter),
        new vscode.CompletionItem('boolean', vscode.CompletionItemKind.TypeParameter),
        new vscode.CompletionItem('any', vscode.CompletionItemKind.TypeParameter),
        new vscode.CompletionItem('void', vscode.CompletionItemKind.TypeParameter)
      );
    }
    
    return items;
  }
}

/**
 * TypeScript Lite 代码操作提供者
 */
class TslCodeActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.ProviderResult<vscode.CodeAction[]> {
    const actions: vscode.CodeAction[] = [];
    const diagnostics = diagnosticCollection.get(document.uri);
    
    if (!diagnostics) return actions;
    
    diagnostics.forEach(diagnostic => {
      if (diagnostic.range.contains(range)) {
        // 添加快速修复操作
        const quickFix = new vscode.CodeAction(
          '快速修复',
          vscode.CodeActionKind.QuickFix
        );
        quickFix.command = {
          command: 'tsl.quickFix',
          title: '快速修复',
          arguments: [document.uri, range]
        };
        actions.push(quickFix);
      }
    });
    
    return actions;
  }
}

/**
 * TypeScript Lite 悬停提示提供者
 */
class TslHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.Hover> {
    const diagnostics = diagnosticCollection.get(document.uri);
    if (!diagnostics) return;
    
    const diagnostic = diagnostics.find(d => d.range.contains(position));
    if (!diagnostic) return;
    
    // 显示错误详情
    const markdown = new vscode.MarkdownString();
    markdown.appendMarkdown(`**${diagnostic.message}**\n\n`);
    
    if (diagnostic.code) {
      markdown.appendMarkdown(`错误代码: \`${diagnostic.code}\`\n\n`);
    }
    
    markdown.appendMarkdown('点击灯泡图标查看修复建议。');
    
    return new vscode.Hover(markdown);
  }
}

/**
 * 修复建议接口
 */
interface FixSuggestion {
  label: string;
  description: string;
  fix: string;
}
