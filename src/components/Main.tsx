
import ProjectCard from './ProjectCard';

const projectsList = [
  {
    id: "1",
    title: "test1",
    imageUrl: "/IMG_1694.jpeg",
    description: "我超屌",
    skill: ["React"]
  },
  {
    id: "4",
    title: "test4",
    imageUrl: "/logo.png",
    description: "南紡專案",
    skill: ["TypeScript", "JavaScript"]
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

function MainContent() {
    return (
        <div className="project-grid" style={{
            flexGrow: 1,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: "24px" 
        }}>
            {projectsList.map((project) => (
                <ProjectCard key={project.id} data={project} />
            ))}
        </div>
    );
}

export default MainContent;