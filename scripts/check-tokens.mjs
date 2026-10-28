import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const ALLOWED_FILES = new Set([
  path.normalize(path.join(ROOT_DIR, 'styles', 'tokens.css')),
  path.normalize(path.join(ROOT_DIR, 'scripts', 'check-tokens.mjs')),
  path.normalize(path.join(ROOT_DIR, 'components', 'hro', 'company-logo.tsx')),
  path.normalize(path.join(ROOT_DIR, 'components', 'hro', 'candidate-avatar.tsx')),
]);

const SCAN_DIRS = ['app', 'components', 'features', 'lib', 'styles'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.css', '.js', '.mjs']);

const HEX_REGEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const RGB_REGEX = /\brgba?\([^)]+\)/g;
const HSL_REGEX = /\bhsla?\([^)]+\)/g;

let violationsCount = 0;

function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const normalizedPath = path.normalize(fullPath);

    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
      scanDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (!EXTENSIONS.has(ext)) continue;
      if (ALLOWED_FILES.has(normalizedPath)) continue;

      checkFile(fullPath);
    }
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Ignore comments if needed, but strict mode flags all raw colors
    const hexMatches = line.match(HEX_REGEX);
    const rgbMatches = line.match(RGB_REGEX);
    const hslMatches = line.match(HSL_REGEX);

    const matches = [...(hexMatches || []), ...(rgbMatches || []), ...(hslMatches || [])];

    if (matches.length > 0) {
      console.error(
        `[TOKEN VIOLATION] ${path.relative(ROOT_DIR, filePath)}:${index + 1} - Found hardcoded color(s): ${matches.join(', ')}`
      );
      violationsCount += matches.length;
    }
  });
}

console.log('Scanning codebase for unauthorized color codes...');
for (const dir of SCAN_DIRS) {
  scanDirectory(path.join(ROOT_DIR, dir));
}

if (violationsCount > 0) {
  console.error(
    `\n✖ Token check failed: ${violationsCount} hardcoded color(s) found outside styles/tokens.css.`
  );
  console.error('All colors must use semantic design tokens defined in styles/tokens.css.\n');
  process.exit(1);
} else {
  console.log('✓ Token check passed: zero hardcoded colors detected outside styles/tokens.css.\n');
  process.exit(0);
}
