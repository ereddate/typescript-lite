#!/usr/bin/env node

import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import minimist from 'minimist';
import ConfigLoader from '../src/config/loader.js';

const args = minimist(process.argv.slice(2));
const configPath = args._[0] || 'tsl.config.js';
const force = args.force || args.f;

if (existsSync(configPath) && !force) {
  console.error(`配置文件已存在: ${configPath}`);
  console.error('使用 --force 或 -f 选项覆盖现有配置文件');
  process.exit(1);
}

const configContent = ConfigLoader.createDefaultConfig(configPath);

try {
  writeFileSync(resolve(process.cwd(), configPath), configContent, 'utf8');
  console.log(`配置文件已创建: ${configPath}`);
} catch (error) {
  console.error(`创建配置文件失败: ${error.message}`);
  process.exit(1);
}
