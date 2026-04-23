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
