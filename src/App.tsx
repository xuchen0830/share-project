
import Siderbar from './components/Siderbar';
import MainContent from './components/Main';
import AddProjectButton from './components/AddProjectButton';



function App() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="admin-container" style={{ 
      display: "flex",          // 1. 讓整體左右併排
      flexDirection: "row",     // 確保是橫向
      minHeight: "100vh", 
      backgroundColor: "#f8fafc", 
      width: "100%",
    }}>
      
      {/* 左側：側邊欄 */}
      <Siderbar /> 

      {/* 右側：主內容包裝區 */}
      <div style={{ 
        flexGrow: 1,            // 2. 自動填滿剩下寬度
        padding: "40px",        // 給內容一點呼吸空間
        display: "flex",
        flexDirection: "column" // 讓右邊內部的東西「標題 -> 內容」由上往下排
      }}>
        
        {/* 標題區域 (現在搬到右邊了) */}
        <div style={{ 
          marginBottom: '30px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px' }}>測試</h1>
            <p style={{ color: '#64748b', marginTop: '8px' }}>測試專案內容</p>
          </div>
          {/* 2. 把原本的 <button> 換成你的組件 */}
          <AddProjectButton onSuccess={handleRefresh} />
        </div>

        {/* 實際內容區 */}
        <MainContent />
      </div>
    </div>
  );
}

export default App;