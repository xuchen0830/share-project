
function Siderbar() {
    const siderbarWidth = "200px"; // 側邊欄寬度
    return (
        <nav className="sidebar" style={{ 
        width: siderbarWidth, 
        backgroundColor: "#e1e8f0",
        padding: "20px",
        }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>側邊欄</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '12px' }}><a href="#home" style={{ color: '#1e293b', textDecoration: 'none'}}>首頁</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#about" style={{ color: '#1e293b', textDecoration: 'none' }}>關於我</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#projects" style={{ color: '#1e293b', textDecoration: 'none' }}>專案</a></li>
            </ul>
            </nav>
    );
}


export default Siderbar;