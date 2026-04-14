const express = require('express'); // 1. 引入 express 工具箱
const cors = require('cors');       // 2. 引入 cors 工具箱
const app = express();              // 3. 這行最重要！把工具箱打開變成 app 物件
const mysql = require('mysql2/promise');

const { exec } = require('child_process');
const path = require('path');
app.use(express.json());
app.use(cors());

const db = mysql.createPool({
  host: 'localhost',     
  user: 'root',          
  password: 'ab5563817',  
  database: 'stock_ai_db' // 確認資料庫名稱完全正確
});

// 建立一個分析 API
app.get('/api/stock/analyze/:symbol', async(req, res) => {
    const symbol = req.params.symbol;
    const uid = req.query.uid;

    if (!uid){
        console.log(`拒絕匿名分析: ${symbol}`)
        return res.status(401).json({ error: "請先登入" })
    }

    try {
        const[rows] = await db.query('SELECT * FROM user_queries WHERE user_id = ?', [uid]);
        if (rows.length === 0){
            console.log(`拒絕未登入`)
            return res.status(401).json({ error: "請先登入" })
        }
        console.log(`正在分析: ${symbol}`)

        const scriptPath = path.join(__dirname, 'ai_scripts' , 'ai_analyst.py');
        const venvPythonPath = path.join(__dirname, '..','.venv', 'bin', 'python3');
    
        // 執行Python AI 腳本
        exec(`"${venvPythonPath}" "${scriptPath}" ${symbol}`, (error, stdout, stderr) => {
            if (error) {
                return res.status(500).json({ error: "AI 罷工了" });
            }
            // 把 Python 印出來的分析結果回傳給 React
            res.json({ analysis: stdout });
        });

    } catch (error) {
        console.error("資料庫讀取失敗:", error);
        return res.status(500).json({ error: "資料庫連線出錯" });
    }

    
});




// 建立一個可以透過網址存取的 API
app.get('/api/stocks', async (req, res) => {
    try {
        // 從資料庫抓取最新的 20 筆股票歷史
        const [rows] = await db.query('SELECT * FROM stock_all_history ORDER BY date DESC');
        
        // 把資料變成 JSON 格式送出去
        res.json(rows); 
    } catch (error) {
        console.error("資料庫讀取失敗:", error);
        res.status(500).json({ error: "資料庫連線出錯" });
    }

});

app.get('/api/stock/data/:symbol', async (req, res) => {
    const symbol = req.params.symbol;

    console.log(`正在為圖表撈資料: ${symbol}`)
    const query = 'SELECT date,close FROM stock_all_history WHERE symbol = ? ORDER BY date ASC';
    
    const [results] = await db.query(query, [symbol]);
    res.json(results);
})

app.post('/api/user/login', async (req, res) => {
    const {user_id,email,display_name,photo_url} = req.body;
    
    try {
        const sql = `
            INSERT INTO user_queries (user_id, email, display_name, photo_url)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            email = VALUES(email),
            display_name = VALUES(display_name),
            photo_url = VALUES(photo_url)
            `;
        await db.query(sql, [user_id, email, display_name, photo_url]);
        res.json({ message:"使用者資料同步成功"})
    } catch (error) {
        console.error("使用者資料同步失敗:", error);
        res.status(500).json({ error: "使用者資料同步失敗" });
    }
})

const port = 3001;
app.listen(port, () => {
    console.log(`Server is running`);
});