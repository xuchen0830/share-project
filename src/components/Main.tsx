
import { useState, useEffect } from 'react'; // 1. 引入 Hooks
import ProjectCard from './ProjectCard';

function MainContent() {
    // 2. 建立一個空陣列，準備放從資料庫抓來的資料
    const [projects, setProjects] = useState<any[]>([]);

    // 3. 網頁一打開，就去問後端 API
    useEffect(() => {
        fetch('http://127.0.0.1:8080/api/projects') // 你的 Node.js 網址
            .then(res => res.json())
            .then(data => {
                // 4. 格式轉換：把資料庫的字串 "React,JS" 轉回 React 喜歡的陣列 ["React", "JS"]
                const formattedData = data.map((p: any) => ({
                    ...p,
                    skill: p.skills ? p.skills.split(',') : []
                }));
                setProjects(formattedData);
            })
            .catch(err => console.error("抓取資料失敗:", err));
    }, []);

    return (
        <div className="project-grid" style={{
            flexGrow: 1,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: "24px" 
        }}>
            {/* 5. 現在渲染的是從資料庫抓來的 projects */}
            {projects.map((project) => (
                <ProjectCard key={project.id} data={project} />
            ))}
        </div>
    );
}

export default MainContent;