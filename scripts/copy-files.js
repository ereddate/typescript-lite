import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const filesToCopy = [
  { src: 'bin/tsl-init.js', dest: 'dist/bin/tsl-init.js' },
  { src: 'README.md', dest: 'dist/README.md' },
  { src: 'LICENSE', dest: 'dist/LICENSE' }
];

const directoriesToCreate = [
  'dist/bin'
];

function ensureDirectoryExists(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function copyFile(src, dest) {
  try {
    copyFileSync(src, dest);
    console.log(`Copied: ${src} -> ${dest}`);
  } catch (error) {
    console.error(`Failed to copy ${src}: ${error.message}`);
  }
}

function main() {
  const rootDir = process.cwd();

  directoriesToCreate.forEach(dir => {
    const dirPath = join(rootDir, dir);
    ensureDirectoryExists(dirPath);
  });

  filesToCopy.forEach(({ src, dest }) => {
    const srcPath = join(rootDir, src);
    const destPath = join(rootDir, dest);
    copyFile(srcPath, destPath);
  });

  console.log('Build completed successfully!');
}

main();
