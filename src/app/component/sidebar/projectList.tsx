'use client'
import { useState } from "react";
import Project from "./project";
// sidebar가 서버 컴포넌트이므로 draggable을 위해 클라이언트 컴포넌트로 project를 래핑

export default function ProjectList({initialProjects} : {initialProjects: List[]}) {
  const [projects, setProjects] = useState(initialProjects);
  return (
    <div>
      { projects.map((project) => {
          return <Project project={project} key={project.id}></Project>
        })
      }
    </div>
  );
}