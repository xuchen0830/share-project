import React, { useState } from 'react';
import asherlogo from './assets/Asher_logo.png';
import StockChart from './StockChart';
import { auth, signInWithGoogle, logout } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';


// 🎨 定義介面樣式 (Styles)
const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
    color: '#111827',
  },
  
  // 🔝 頂部導航列 (Navbar)
  navbar: {
    backgroundColor: '#ffffff',
    padding: '15px 30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    // 💡 這裡放你的 Logo 圖片網址，或用一個圓圈代表
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    backgroundColor: '#4f46e5', // Logo 顏色
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  loginBtn: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: '0.2s',
  },
  // 🔍 搜尋區塊
  searchSection: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '0 20px',
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    padding: '12px 20px',
    fontSize: '16px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    width: '250px',
    outline: 'none',
    transition: '0.2s',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  button: {
    padding: '12px 28px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#4f46e5', // Indigo 按鈕顏色
    color: 'white',
    cursor: 'pointer',
    transition: '0.2s',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  buttonLoading: {
    backgroundColor: '#a5b4fc', // 讀取中的按鈕顏色
    cursor: 'not-allowed',
  },
  // 📈 報告區塊
  reportSection: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '0 20px 60px 20px',
  },
  loadingText: {
    fontSize: '18px',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: '50px',
  },
  reportCard: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  reportHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '15px',
  },
  reportTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  reportDate: {
    fontSize: '14px',
    color: '#6b7280',
  },
  reportText: {
    fontSize: '16px',
    lineHeight: '1.7',
    color: '#374151',
    whiteSpace: 'pre-wrap', // 保留 Llama 3 的換行
  },
};

function StockDashboard() {
    const [symbol, setSymbol] = useState('');
    const [report, setReport] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('');
    const [chartData, setChartData] = useState([]);
    const [user, setUser] = useState(null);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser){
                try {
                    await fetch(`http://localhost:3001/api/user/login`,{
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            user_id: currentUser.uid,
                            email: currentUser.email,
                            display_name: currentUser.displayName,
                            photo_url: currentUser.photoURL,
                        }),
                    })
                    console.log("MySQL使用者資料已更新")
                } catch (error) {
                    console.error("使用者資料更新失敗:", error)    
                }
            }
        });
        return () => unsubscribe();
    }, []);


  const startAnalysis = () => {
    if (!symbol) return alert("請輸入股票代號");

    if (!user) {
        alert("請先登入");
        return;
    }

    setLoading(true);
    setReport(''); // 清空舊報告
    setChartData([]); // 清空舊圖表資料
    
    fetch(`http://localhost:3001/api/stock/data/${symbol}`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
            setChartData(data.map(item => ({ ...item, close: parseFloat(item.close) })));
      }
    });


    fetch(`http://localhost:3001/api/stock/analyze/${symbol}?uid=${user.uid}`)
        .then(res => {
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }
            return res.json();
        })
        .then(data => {
            setReport(data.analysis);
            setLoading(false);
            // 記錄更新時間
            const now = new Date();
            setLastUpdated(now.toLocaleTimeString());
        })
        .catch(err => {
            console.error("抓取失敗:", err);
            setReport("⚠️ 連線失敗，請檢查後端伺服器是否啟動。");
            setLoading(false);
        });
      
        return fetch(`http://localhost:3001/api/stock/data/${symbol}`)
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) {
                setChartData(data.map(item => ({ ...item, close: parseFloat(item.close) })))
            }
        })
        .catch(err => {
            console.error("抓取失敗:", err);
            setReport("連線失敗，請檢查後端伺服器是否啟動。");
            setLoading(false);
        });
    
  };

  return (
    <div style={styles.container}>
      {/* 1. 頂部導航列 (Navbar) 與 Logo */}
      <nav style={styles.navbar}>
        <div style={styles.logoSection}>
          <div >
            <img src = {asherlogo} style={{width: '75px', height: 'auto'}} />
          </div>
          <h1 style={styles.title}>Asher Stock AI</h1>
        </div>
        <div style={{ display: 'flex', gap: '15px',alignItems: 'center'}}>
          {user ? (
            <>
                <img src={user.photoURL} style={{ width: '40px', height: '40px', borderRadius: '50%'}} alt="avatar"/>
                <span style={{ fontSize: '14px'}}>{user.displayName}</span>
                <button onClick={logout} style={styles.loginBtn}>登出</button>
            </>
          ) : (
            <button onClick={signInWithGoogle} style={styles.loginBtn}>登入</button>
          )}
        </div>
      </nav>

      {/* 🔍 2. 搜尋與按鈕區塊 */}
      <div style={styles.searchSection}>
        <input 
          style={styles.input}
          value={symbol} 
          onChange={(e) => setSymbol(e.target.value.toUpperCase())} // 自動轉大寫
          placeholder="輸入代號 (例如 TSLA, 2330.TW)"
          // 按下 Enter 鍵直接開始分析
          onKeyPress={(e) => { if (e.key === 'Enter') startAnalysis(); }}
        />
        <button 
          style={{ ...styles.button, ...(loading ? styles.buttonLoading : {}) }}
          onClick={startAnalysis}
          disabled={loading}
        >
          {loading ? '分析中...' : '分析股票'}
        </button>
      </div>
      
      {/* 📈 3. 報告顯示區塊 */}
      <div style={styles.reportSection}>
        {chartData.length > 0 && <StockChart data={chartData} symbol={symbol}/>}

        {loading ? (
          <p style={styles.loadingText}>正在抓取最新數據並利用Llama 3分析...</p>
        ) : (
          report && (
            <div style={styles.reportCard}>
              <div style={styles.reportHeader}>
                <h3 style={styles.reportTitle}>{symbol} 專業分析報告</h3>
                <span style={styles.reportDate}>更新於: {lastUpdated}</span>
              </div>
              <p style={styles.reportText}>
                {report}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default StockDashboard;