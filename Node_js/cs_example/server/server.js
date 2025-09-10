const { app, initializeStorage } = require('./app');

const PORT = process.env.PORT || 3000;

// 启动服务器
const startServer = async () => {
  try {
    // 初始化存储目录
    await initializeStorage();
    debugLog('Stroage directries initialized');

    // 启动服务器
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        debugLog(`Available endpoints:`);
        debugLog(` GET /api/resources/:type (texts, images, autio, files)`);
        debugLog(` POST /api/save-text`);
    });
    } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// 启动应用
startServer();