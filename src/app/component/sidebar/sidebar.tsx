'use client'
import React, { useEffect } from 'react';
import SidebarTree from "./sidebarTree";
import { useSelector, useDispatch } from "react-redux";
import { fetchProjects } from '@/app/store/projectsSlice';
import type { RootState, AppDispatch } from "@/app/store/store";

export default function Sidebar() {
  const dispatch: AppDispatch = useDispatch();
  const projects = useSelector((state: RootState) =>
    state.projects.projects
  ) as List[];

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);
  
  return (
    <nav className="flex flex-col w-[270px] bg-gray-50 shadow-md text-[#46484d] text-[14px] border-b-1 border-r-1 border-gray-300/85 h-full">
      <div className="border-b-1 border-gray-300/85 p-2 pl-2 pt-3 basis-[150px]">
          <div className="font-[600] cursor-pointer hover:bg-gray-200/65 p-[3px] pl-[15px] rounded-[4px]">Settings</div>
          <div className="font-[600] cursor-pointer hover:bg-gray-200/65 p-[3px] pl-[15px] rounded-[4px]">Logs</div>
      </div>
      <div className="p-2 pr-3">
        <div className="font-[600] pl-2">Workspace</div>
        <SidebarTree initialProjects={projects} />
      </div>
    </nav>
  );
}