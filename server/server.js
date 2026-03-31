import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import multer from 'multer'; // 1. 引入 multer
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

// 2. 讓前端可以透過網址讀取圖片
app.use('/uploads', express.static('uploads'));

// 自動建立 uploads 資料夾 (防呆)
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// 3. 設定圖片存儲邏輯
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'ab5563817',
    database: 'my_resume',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 4. 修改後的新增 API：加入 upload.single('image')
app.post('/api/projects', upload.single('image'), async (req, res) => {
    try {
        // 檔案資訊在 req.file，文字資訊在 req.body
        const { title, description, skills } = req.body;
        
        // 如果有傳檔案，路徑就是 /uploads/檔名，否則給空字串
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

        const sql = 'INSERT INTO projects (title, imageUrl, description, skills) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(sql, [title, imageUrl, description, skills]);
        
        res.json({ message: '專案新增成功！', id: result.insertId, imageUrl });
    } catch (err) {
        console.error("後端報錯：", err);
        res.status(500).json({ error: err.message });
    }
});

// 刪除 API (維持原樣)
app.delete('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM projects WHERE id = ?', [id]);
        res.json({ message: '專案已成功刪除！' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 啟動與 GET API (維持原樣)
async function startApp() {
    try {
        await pool.query('SELECT 1');
        console.log('✅ MySQL 連線成功！');

        app.get('/api/projects', async (req, res) => {
            try {
                const [projects] = await pool.query('SELECT * FROM projects');
                res.json(projects);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.listen(8080, () => {
            console.log('🚀 後端伺服器運行中：http://localhost:8080');
        });
    } catch (err) {
        console.error('❌ 啟動失敗：', err.message);
    }
}

// 告訴 Node.js：如果有人存取 /uploads 開頭的網址，請去 uploads 資料夾抓檔案
app.use('/uploads', express.static('uploads'));

startApp();