import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2));
const versionType = args._[0] || 'patch';
const preRelease = args.pre || args.p;
const dryRun = args.dry || args.d;

const VERSION_TYPES = {
  major: 'major',
  minor: 'minor',
  patch: 'patch',
  premajor: 'premajor',
  preminor: 'preminor',
  prepatch: 'prepatch',
  prerelease: 'prerelease'
};

function getCurrentVersion() {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  return packageJson.version;
}

function bumpVersion(currentVersion, type, preRelease) {
  const parts = currentVersion.split('.').map(Number);
  let [major, minor, patch] = parts;

  switch (type) {
    case VERSION_TYPES.major:
      major++;
      minor = 0;
      patch = 0;
      break;
    case VERSION_TYPES.minor:
      minor++;
      patch = 0;
      break;
    case VERSION_TYPES.patch:
      patch++;
      break;
    case VERSION_TYPES.premajor:
      major++;
      minor = 0;
      patch = 0;
      return `${major}.${minor}.${patch}-${preRelease || 'alpha'}.0`;
    case VERSION_TYPES.preminor:
      minor++;
      patch = 0;
      return `${major}.${minor}.${patch}-${preRelease || 'alpha'}.0`;
    case VERSION_TYPES.prepatch:
      patch++;
      return `${major}.${minor}.${patch}-${preRelease || 'alpha'}.0`;
    case VERSION_TYPES.prerelease:
      const preParts = currentVersion.split('-');
      if (preParts.length > 1) {
        const preVersionParts = preParts[1].split('.');
        const preVersion = parseInt(preVersionParts[1]) + 1;
        return `${major}.${minor}.${patch}-${preVersionParts[0]}.${preVersion}`;
      } else {
        return `${major}.${minor}.${patch}-${preRelease || 'alpha'}.0`;
      }
    default:
      throw new Error(`Invalid version type: ${type}`);
  }

  return `${major}.${minor}.${patch}`;
}

function updatePackageJson(newVersion) {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  packageJson.version = newVersion;
  writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
  console.log(`Updated package.json version to ${newVersion}`);
}

function updateChangelog(newVersion, versionType) {
  const changelog = readFileSync('CHANGELOG.md', 'utf8');
  const date = new Date().toISOString().split('T')[0];
  const versionHeader = `## [${newVersion}] - ${date}`;

  const sectionMap = {
    major: '### Breaking Changes\n\n',
    minor: '### Added\n\n',
    patch: '### Fixed\n\n',
    premajor: '### Breaking Changes\n\n',
    preminor: '### Added\n\n',
    prepatch: '### Fixed\n\n',
    prerelease: '### Changed\n\n'
  };

  const newSection = `${versionHeader}\n\n${sectionMap[versionType] || '### Changed\n\n'}`;

  const updatedChangelog = changelog.replace(
    '## [Unreleased]',
    `## [Unreleased]\n\n${newSection}`
  );

  writeFileSync('CHANGELOG.md', updatedChangelog, 'utf8');
  console.log(`Updated CHANGELOG.md with version ${newVersion}`);
}

function createGitTag(newVersion) {
  try {
    execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, { stdio: 'inherit' });
    console.log(`Created git tag v${newVersion}`);
  } catch (error) {
    console.error('Failed to create git tag:', error.message);
  }
}

function main() {
  if (!VERSION_TYPES[versionType]) {
    console.error(`Invalid version type: ${versionType}`);
    console.error(`Valid types: ${Object.values(VERSION_TYPES).join(', ')}`);
    process.exit(1);
  }

  const currentVersion = getCurrentVersion();
  console.log(`Current version: ${currentVersion}`);

  const newVersion = bumpVersion(currentVersion, versionType, preRelease);
  console.log(`New version: ${newVersion}`);

  if (dryRun) {
    console.log('Dry run mode - no changes will be made');
    return;
  }

  updatePackageJson(newVersion);
  updateChangelog(newVersion, versionType);
  createGitTag(newVersion);

  console.log(`\nVersion bumped to ${newVersion}`);
  console.log('Please review the changes and commit them:');
  console.log(`  git add package.json CHANGELOG.md`);
  console.log(`  git commit -m "chore: bump version to ${newVersion}"`);
  console.log(`  git push origin v${newVersion}`);
}

main();
