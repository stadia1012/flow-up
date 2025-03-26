'use client'
import Folder from "./folder";
import Project from "./project";
import { useState } from "react";
const Projects: List[] = [
  {
    name: 'Project 1',
    lists: [
      {
        name: 'Folder 1',
        lists: [
          {
            name: 'List 1-1'
          },
          {
            name: 'List 1-2'
          }
        ],
        isFolded: true
      },
      {
        name: 'Folder 2',
        lists: [
          {
            name: 'List 2-1'
          },
          {
            name: 'List 2-2'
          }
        ],
        isFolded: true
      },
      {
        name: 'Folder 3',
        lists: [
          {
            name: 'List 3-1'
          },
          {
            name: 'List 3-2'
          }
        ],
        isFolded: true
      }
    ],
    isFolded: true
  }
]

export default function Sidebar() {

  const [isShow, setIsShow] = useState(false);
  const setShow = () => {
    setIsShow(!isShow);
  }
  return (
    <nav className="flex flex-col w-[270px] bg-gray-50 shadow-md text-[#46484d] text-[14px] border-b-1 border-r-1 border-gray-300/85 h-full">
      <div className="border-b-1 border-gray-300/85 p-3 pl-4 basis-[120px]">
          <div className="font-[600] mb-[3px]">Settings</div>
          <div className="font-[600] mb-[3px]">Logs</div>
      </div>
      <div className="p-2 pr-3">
        <div className="font-[600] pl-2">Workspace</div>
        {
          Projects.map((project, index) => {
            return <Project project={project} key={index}></Project>
          })
        }

        {/* {
          Projects.map((folder, index) => {
            return <Folder folder={folder} key={index}></Folder>
          })
        } */}
      </div>
    </nav>
  );
}