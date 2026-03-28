
import Siderbar from './components/select';
import MainContent from './components/Main';



function App() {
  
  return (
    
    <div className="admin-container" style={{ 
      display: "flex", 
      flexDirection: "column", 
      minHeight: "100vh", 
      backgroundColor: "#f8fafc", 
      width: "100%",
    }}>
      {/* 標題區域 */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px' }}>測試</h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>測試專案內容。</p>
        </div>
        <button style={{ 
          backgroundColor: '#1e293b', 
          color: 'white', 
          padding: '10px 20px', 
          borderRadius: '6px', 
          border: 'none',
          cursor: 'pointer'
        }}>
          吃我屌
        </button>
      </div>
      <div style={{ display: 'flex', gap: '24px' ,minHeight: "100vh"}}>
        <Siderbar /> {/* 3. 呼叫側邊欄組件 */}
        <MainContent /> {/* 4. 呼叫主內容組件 */}
      </div>
    </div>
  );
}

export default App;