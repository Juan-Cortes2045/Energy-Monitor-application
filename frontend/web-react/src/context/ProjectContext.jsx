import { createContext, useContext, useState } from "react";

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);

  const addProject = (project) => {
    setProjects((prev) => [project, ...prev]);
  };

  return (
    <ProjectContext.Provider value={{ projects, setProjects, addProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects debe usarse dentro de <ProjectProvider>");
  return ctx;
};

export default ProjectContext;