import Project from "./project";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function getProjects(): Promise<List[]> {
  const projects = await prisma.w_PROJECTS.findMany({
    include: {
      folders: {
        include: {
          items: true,
        },
      },
    },
  });

  return projects.map((project) => ({
    name: project.NAME ?? '',
    isFolded: true,
    lists: project.folders.map((folder) => ({
      name: folder.NAME ?? '',
      isFolded: true,
      lists: folder.items.map((item) => ({
        name: item.NAME ?? '',
      })),
    })),
  }));
}

export default async function Sidebar() {
  const projects = await getProjects();
  return (
    <nav className="flex flex-col w-[270px] bg-gray-50 shadow-md text-[#46484d] text-[14px] border-b-1 border-r-1 border-gray-300/85 h-full">
      <div className="border-b-1 border-gray-300/85 p-2 pl-2 pt-3 basis-[150px]">
          <div className="font-[600] cursor-pointer hover:bg-gray-200/65 p-[3px] pl-[15px] rounded-[4px]">Settings</div>
          <div className="font-[600] cursor-pointer hover:bg-gray-200/65 p-[3px] pl-[15px] rounded-[4px]">Logs</div>
      </div>
      <div className="p-2 pr-3">
        <div className="font-[600] pl-2">Workspace</div>
        {
          projects.map((project, index) => {
            return <Project project={project} key={index}></Project>
          })
        }
      </div>
    </nav>
  );
}