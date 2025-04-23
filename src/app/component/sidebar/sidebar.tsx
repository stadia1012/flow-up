'use server'
import SidebarAddButton from "./sidebarAddButton";
import SidebarTreeWrapper from "./sidebarTreeWrapper";
import { getProjects } from '@/app/controllers/projectController';

export default async function Sidebar() {
  const projects = await getProjects();
  
  return (
    <nav className="flex flex-col w-[270px] bg-gray-50/90 shadow-md text-[#46484d] text-[14px] border-b-1 border-r-1 border-gray-300/85 h-full">
      <div className="border-b-1 border-gray-300/85 p-2 pl-2 pt-3 basis-[150px]">
          <div className="font-[600] cursor-pointer hover:bg-gray-200/65 p-[3px] pl-[15px] rounded-[4px]">Settings</div>
          <div className="font-[600] cursor-pointer hover:bg-gray-200/65 p-[3px] pl-[15px] rounded-[4px]">Logs</div>
      </div>
      <div className="p-2 pr-3">
        <div className="flex">
          <div className="font-[600] pl-2">Workspace</div>
          <div className="ml-auto">
            <SidebarAddButton
              addType="project"
              parentId={0}
            />
          </div>
        </div>
        <SidebarTreeWrapper initialProjects={projects} />
      </div>
    </nav>
  );
}