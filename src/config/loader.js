import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEFAULT_CONFIG = {
  compiler: {
    target: 'esnext',
    strict: false,
    noImplicitAny: false,
    sourceMap: false,
    sourceMapWithCode: false,
    removeComments: false,
    preserveConstEnums: false,
    experimentalDecorators: false,
    emitDecoratorMetadata: false
  },
  cache: {
    enabled: true,
    directory: '.tsl-cache',
    memory: {
      maxSize: 1000,
      ttl: 3600000,
      cleanupThreshold: 0.8
    },
    disk: {
      maxSize: 104857600,
      ttl: 86400000,
      compression: true
    },
    dependencyTracking: {
      enabled: true,
      maxDependencies: 1000
    }
  },
  parallel: {
    enabled: true,
    maxWorkers: 4
  },
  advancedTypes: {
    enabled: true,
    conditionalTypes: true,
    mappedTypes: true,
    typeGuards: true,
    templateLiteralTypes: true
  },
  errorHandling: {
    maxErrors: 100,
    maxWarnings: 100,
    showContext: true,
    showSuggestions: true,
    showExamples: true
  },
  include: [],
  exclude: ['node_modules/**', 'dist/**', 'build/**'],
  watch: false,
  watchOptions: {
    usePolling: false,
    interval: 100,
    binaryInterval: 300,
    alwaysStat: false,
    depth: 99,
    ignoreInitial: true,
    followSymlinks: true,
    ignored: ['node_modules/**', '.git/**']
  }
};

const CONFIG_FILE_NAMES = [
  'tsl.config.js',
  'tsl.config.json',
  'tsl.config.mjs',
  '.tslrc',
  '.tslrc.js',
  '.tslrc.json',
  'typescript-lite.config.js',
  'typescript-lite.config.json'
];

class ConfigLoader {
  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.configPath = null;
  }

  load(configPath = null) {
    if (configPath) {
      this.configPath = configPath;
      this.loadConfigFile(configPath);
    } else {
      this.searchConfigFile();
    }

    return this.config;
  }

  searchConfigFile(startDir = process.cwd()) {
    let currentDir = startDir;
    const rootDir = parseRootDir(currentDir);

    while (currentDir !== rootDir) {
      for (const fileName of CONFIG_FILE_NAMES) {
        const filePath = join(currentDir, fileName);
        if (existsSync(filePath)) {
          this.configPath = filePath;
          this.loadConfigFile(filePath);
          return this.config;
        }
      }
      currentDir = dirname(currentDir);
    }

    return this.config;
  }

  loadConfigFile(filePath) {
    try {
      const ext = filePath.split('.').pop();
      let userConfig;

      switch (ext) {
        case 'js':
        case 'mjs':
          userConfig = this.loadJSConfig(filePath);
          break;
        case 'json':
          userConfig = this.loadJSONConfig(filePath);
          break;
        default:
          userConfig = this.loadJSONConfig(filePath);
      }

      this.mergeConfig(userConfig);
    } catch (error) {
      throw new Error(`Failed to load config file: ${filePath}\n${error.message}`);
    }
  }

  loadJSConfig(filePath) {
    delete require.cache[require.resolve(filePath)];
    const module = require(filePath);
    return module.default || module;
  }

  loadJSONConfig(filePath) {
    const content = readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  }

  mergeConfig(userConfig) {
    this.config = deepMerge(this.config, userConfig);
  }

  get(path) {
    return getNestedValue(this.config, path);
  }

  set(path, value) {
    setNestedValue(this.config, path, value);
  }

  reset() {
    this.config = { ...DEFAULT_CONFIG };
    this.configPath = null;
  }

  validate() {
    const errors = [];

    if (!this.config.compiler) {
      errors.push('Missing compiler configuration');
    }

    if (!this.config.cache) {
      errors.push('Missing cache configuration');
    }

    if (this.config.parallel && this.config.parallel.enabled) {
      if (!this.config.parallel.maxWorkers || this.config.parallel.maxWorkers < 1) {
        errors.push('Invalid maxWorkers value');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }

    return true;
  }

  getConfigPath() {
    return this.configPath;
  }

  toJSON() {
    return JSON.stringify(this.config, null, 2);
  }

  static createDefaultConfig(filePath = 'tsl.config.js') {
    const configContent = `export default {
  compiler: {
    target: 'esnext',
    strict: false,
    noImplicitAny: false,
    sourceMap: false,
    removeComments: false
  },
  cache: {
    enabled: true,
    directory: '.tsl-cache'
  },
  parallel: {
    enabled: true,
    maxWorkers: 4
  },
  advancedTypes: {
    enabled: true
  },
  errorHandling: {
    maxErrors: 100,
    maxWarnings: 100
  },
  include: [],
  exclude: ['node_modules/**', 'dist/**']
};
`;
    return configContent;
  }
}

function deepMerge(target, source) {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }

  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function getNestedValue(obj, path) {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || !isObject(current[key])) {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

function parseRootDir(dir) {
  const parts = dir.split(/[/\\]/);
  if (parts.length > 0 && parts[0] === '') {
    return '/';
  }
  return dir;
}

const configLoader = new ConfigLoader();

export default configLoader;
export { DEFAULT_CONFIG, CONFIG_FILE_NAMES };
