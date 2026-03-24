
import ProjectCard from './components/ProjectCard';

const projectsList = [
  {
    id: "1",
    title: "test1",
    imageUrl: "/IMG_1694.jpeg",
    description: "我超屌",
    skill: ["React"]
  },
  {
    id: "2",
    title: "test2",
    imageUrl: "/IMG_1940.jpeg",
    description: "我超帥",
    skill: ["CSS", "TypeScript"]
  },
  {
    id: "3",
    title: "test3",
    imageUrl: "/IMG_2013.jpeg",
    description: "我分手了好難過干",
    skill: ["TypeScript", "JavaScript"]
  }
];

function App() {
  return (
    <div className="admin-container" style={{ 
      backgroundColor: "#f8fafc", 
      minHeight: "100vh", 
      padding: "40px" 
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

      <div className="project-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", // 自動填充，最小 300px
        gap: "24px" 
      }}>
        {projectsList.map((project) => (
          <ProjectCard key={project.id} data={project} />
        ))}
      </div>
    </div>
  );
}

export default App;