'use client'
import { useState } from "react";
import Folder from "./folder";
export default function Project({project}: {project: List}) {
  const [isFolded, setIsFolded] = useState(project.isFolded);

  return (
    <>
    <div className={`group folder flex items-center p-[2px] pl-1 cursor-default hover:bg-gray-200/65 rounded-[5px] h-[30px]`} onClick={() => {setIsFolded(!isFolded)}}>
      {/* 폴더 아이콘 */}
      <div className="w-[22px] h-[22px] p-[1.8px] hover:bg-gray-300 transition-all cursor-pointer mr-[7px] rounded-[4px]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
        <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z"></path>
        <path d="M3 10h18"></path>
        <path d="M10 3v18"></path>
      </svg>
      </div>
      {/* 폴더 이름 */}
      <span className="relative top-[1px] cursor-pointer">{project.name}</span>
      {/* 버튼 */}
      <div className="flex p-[3px] ml-auto items-center hidden group-hover:flex">
        <div className="w-[22px] h-[22px] p-[3px] hover:bg-gray-300 rounded-[7px] transition-all cursor-pointer" onClick={(e) => { e.stopPropagation(); }}>
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" strokeWidth="2">
            <path d="M12 5l0 14"></path>
            <path d="M5 12l14 0"></path>
          </svg>
        </div>
        <div className="w-[22px] h-[22px] p-[3px] hover:bg-gray-300 rounded-[7px] transition-all cursor-pointer" onClick={(e) => { e.stopPropagation(); }}>
          <svg className="w-full h-full relative top-[1px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" strokeWidth="2">
            <path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
            <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
            <path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
          </svg>
        </div>
      </div>
    </div>
    {!isFolded &&
      <> {
          project.lists?.map((folder, index) => {
            return <Folder folder={folder} key={index}></Folder>
          })
      } </>
    }
    </>
  );
}