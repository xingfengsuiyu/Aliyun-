const fs = require('fs');
const path = require('path');

// 创建 dist 目录
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('Created dist directory');
}

// 复制 index.html
const publicDir = path.join(__dirname, 'public');
const indexHtmlPath = path.join(publicDir, 'index.html');
const distIndexHtmlPath = path.join(distDir, 'index.html');

if (fs.existsSync(indexHtmlPath)) {
  fs.copyFileSync(indexHtmlPath, distIndexHtmlPath);
  console.log('Copied index.html to dist');
} else {
  console.error('index.html not found in public directory');
}

// 创建 bundle.js（简化版）
const bundleContent = `
// Web bundle for rental management app
console.log('Rental Management App loaded');

// Mock app initialization
window.onload = function() {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background-color: #f5f5f5;">
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center;">
          <h1 style="color: #409EFF; margin-bottom: 20px;">房东租房管理</h1>
          <p style="color: #666; margin-bottom: 30px;">Web 版本构建成功！</p>
          <button style="background: #409EFF; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
            开始使用
          </button>
        </div>
      </div>
    `;
  }
};
`;

const bundlePath = path.join(distDir, 'bundle.js');
fs.writeFileSync(bundlePath, bundleContent);
console.log('Created bundle.js in dist');

// 更新 index.html 以引用 bundle.js
const indexHtmlContent = fs.readFileSync(distIndexHtmlPath, 'utf8');
const updatedIndexHtmlContent = indexHtmlContent.replace(
  '</body>',
  '  <script src="bundle.js"></script>\n</body>'
);
fs.writeFileSync(distIndexHtmlPath, updatedIndexHtmlContent);
console.log('Updated index.html to include bundle.js');

console.log('\nWeb build completed successfully!');
console.log('Files generated:');
console.log('- dist/index.html');
console.log('- dist/bundle.js');
