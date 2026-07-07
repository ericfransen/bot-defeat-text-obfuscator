const fs = require('fs');
const path = require('path');

const tsxPath = path.join(__dirname, '../PhantomShield.tsx');
const jsxPath = path.join(__dirname, '../PhantomShield.jsx');
const demoPath = path.join(__dirname, '../demo.html');

if (!fs.existsSync(tsxPath) || !fs.existsSync(jsxPath)) {
  console.error('Error: Component files not found.');
  process.exit(1);
}

const tsxCode = fs.readFileSync(tsxPath, 'utf8');
const jsxCode = fs.readFileSync(jsxPath, 'utf8');
let demoHtml = fs.readFileSync(demoPath, 'utf8');

function escapeForTemplateLiteral(code) {
  return code
    .replace(/\\/g, '\\\\')    // escape backslashes first
    .replace(/`/g, '\\`')       // escape backticks
    .replace(/\${/g, '\\${');   // escape template literal placeholders
}

const escapedTsx = escapeForTemplateLiteral(tsxCode);
const escapedJsx = escapeForTemplateLiteral(jsxCode);

// Replace TSX constant
demoHtml = demoHtml.replace(
  /(const DYNAMIC_COMPONENT_TSX = `)[\s\S]*?(`;\s*\n\s*const DYNAMIC_COMPONENT_JSX = `)/,
  (_, p1, p2) => p1 + escapedTsx + p2
);

// Replace JSX constant
demoHtml = demoHtml.replace(
  /(const DYNAMIC_COMPONENT_JSX = `)[\s\S]*?(`;\s*\n\s*const DYNAMIC_USAGE_CODE = `)/,
  (_, p1, p2) => p1 + escapedJsx + p2
);

fs.writeFileSync(demoPath, demoHtml, 'utf8');
console.log('Successfully synced PhantomShield files with demo.html');
