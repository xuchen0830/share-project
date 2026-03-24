import type React from "react";

interface Project {
    id: string;
    title: string;
    imageUrl: string;
    description: string;
    skill: string[];
}

interface ProjectCardProps {
    data: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ data }) => {
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
            <img src={data.imageUrl} alt={data.title} style={{ 
                width: "100%", 
                borderRadius: "4px",
                objectFit: "cover", 
            }}/>
            <div className="card-body" style={{
                padding:'16px',
                flexGrow: 1 ,
                display:'flex',
                flexDirection:'column',
                justifyContent:'space-between',
            }}>
                <h2 style={{margin:'0 0 8px 0'}}>{data.title}</h2>
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
