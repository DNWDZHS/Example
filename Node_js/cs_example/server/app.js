const debugMode = process.env.DEBUG == 'true' || process.argv.includes('--debug');
debugLog("DEBUG = ", process.env.DEBUG, "debugMode = ", debugMode);

function debugLog(...args){
    if(debugMode){
        console.log('[DEBUG]', ...args);
    }
}

const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app =express();

// 中间件配置
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));
app.use('/resources', express.static(path.join(__dirname, 'storage')));

// 确保存储目录存在的工具函数
const ensureDirExits = async (dirPath) => {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true});
    }
};

// 初始化存储目录
const initializeStorage = async () => {
    await ensureDirExits(path.join(__dirname, 'storage/texts'));
    await ensureDirExits(path.join(__dirname, 'storage/images'));
    await ensureDirExits(path.join(__dirname, 'storage/audio'));
    await ensureDirExits(path.join(__dirname, 'storage/files'));
};

// 获取资源列表的API
app.get('/api/resources/:type', async (req, res) => {
    try {
        const resourceType = req.params.type;
        const validTypes = ['texts', 'images', 'audio', 'files'];

        if (!validTypes.includes(resourceType)){
            return res.status(400).json({ message: 'Invalid resource type' });
        }
        
        const resourcePath = path.join(__dirname, 'storage', resourceType);
        const files = await fs.readdir(resourcePath);

        // 过滤隐藏文件
        const visibleFiles = files.filter(file => !file.startsWith('.'));
        debugLog("resourceType: ", resourceType, "visibleFiles: ", visibleFiles);
        res.json(visibleFiles);
    } catch (error) {
        console.error('Error reading resources:', error);
        res.status(500).json({ message: 'Error reading resources' });
    }
});

// 保存文本的API
app.post('/api/save-text', async(req,res) => {
    try {
        const { filename, content } = req.body;

        if(!filename || !content) {
            return res.status(400).json({ message: 'Filename and content are required' });
        }

        // 简单的文件名安全验证
        if (!/^[a-zA-Z0-9_-]+\.txt$/.test(filename)) {
            return res.status(400).json({ message: 'Invalid filename' });
        }

        const filePath = path.join(__dirname, 'storage/texts', filename);
        await fs.writeFile(filePath, content);

        res.json({ success: true, message: 'Text saved successfully' });
    } catch (error) {
        console.error('Error saving text:', error);
        res.status(500).json({ message: 'Error saving text' });
    }
});

// 导出app和初始化函数
module.exports = { app, initializeStorage, debugLog };