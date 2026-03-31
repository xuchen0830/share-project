import type React from "react";

interface Project {
    id: number;
    title: string;
    imageUrl: string;
    description: string;
    skill: string[];
}

interface ProjectCardProps {
    data: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ data }) => {
    const handleDelete = async () => {
        if (!window.confirm("你確定要刪掉這個專案嗎？")) return;

        try {
            const response = await fetch(`http://127.0.0.1:8080/api/projects/${data.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert("刪除成功！");
                window.location.reload();
            }
        } catch (err) {
            console.error("刪除失敗:", err);
        }
    };

    return (
        <div className="project-card" style={{
            border: "1px solid #ccc",
            borderRadius: "12px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fff",
            boxShadow: "0px 4px 6px -1px rgba(0,0,0,0.1)",
            overflow: "hidden",
            transition: "transform 0.5s",
        }}>
            // ProjectCard.tsx 內部
            <img 
            // 關鍵：在路徑前面補上後端的網址
                src={`http://127.0.0.1:8080${data.imageUrl}`} 
                alt={data.title} 
                style={{ 
                width: "100%", 
                height: "400px", 
                objectFit: "cover", 
                // ... 其他樣式
                }}
            />
            <div className="card-body" style={{
                padding:'16px',
                flexGrow: 1 ,
                display:'flex',
                flexDirection:'column',
                justifyContent:'space-between',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{margin:'0 0 8px 0'}}>{data.title}</h2>
                    <button 
                        onClick={handleDelete}
                        style={{ 
                            backgroundColor: '#fee2e2', 
                            color: '#ef4444', 
                            border: 'none', 
                            borderRadius: '4px', 
                            padding: '4px 8px', 
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        刪除
                    </button>
                </div>
                <p style={{
                        margin:'0 0 16px 0',
                        fontSize:'14px',
                        color:'#64748b',
                        lineHeight:'1.5',
                        display:'-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}>{data.description}</p>
                <div style={{display:'flex',gap:'8px',marginTop:'auto'}}>
                   {data.skill.map((skill, index) => (
                      <span key={index} style={{
                        backgroundColor: '#f1f5f9',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: '500',
                      }}>
                          {skill}
                      </span>
                   ))}
                </div>
            </div>
          </div>
    )
};

export default ProjectCard;
