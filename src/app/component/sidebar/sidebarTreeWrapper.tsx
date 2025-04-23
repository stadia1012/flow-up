'use client'
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/app/store/store";
import { setProjectsState }  from "@/app/store/projectsSlice";
import SidebarTree from "./sidebarTree";

{/* {
  1) Sidebar : projects SSR
  2) SidebarTreeWrapper : redux에 projects 등록
  3) SidebarTree : drag & drop, 내부 project 순서 변경 
  } */}

export default function SidebarTreeWrapper({ initialProjects }: { initialProjects: List[] }) {
  const dispatch = useDispatch();
  
  // server에서 받은 projects를 redux에 반영
  useEffect(() => {
    dispatch(setProjectsState({
      initialProjects: initialProjects
    }));
  }, [initialProjects]);

  const projects = useSelector((state: RootState) =>
    state.projects.projects
  ) as List[];

  return (
    <>
      <SidebarTree initialProjects={projects} />
    </>
  )
}