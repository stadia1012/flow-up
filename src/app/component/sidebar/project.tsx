'use client'
import { useState, useRef, useEffect } from "react";
import Folder from "./folder";
import SidebarSettingButton from "./sidebarSettingButton";
import { updateProjectName } from '@/app/controllers/projectController';

export default function Project({project}: {project: List}) {
  const [isFolded, setIsFolded] = useState(project.isFolded); // 폴더 펼치기/접기
  const [isRename, setIsRename] = useState(false); // 이름변경 여부
  const [projectName, setProjectName] = useState(project.name);
  const renameRef = useRef<HTMLInputElement>(null); // 이름변경 input ref
  
  useEffect(() => {
    console.log('isRename 상태 변경:', isRename);
    if (isRename && renameRef.current) {
      renameRef.current.focus();
    }
  }, [isRename]);

  const handleRename = () => {
    setIsRename(prev => !prev);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  }

  const handleBlur = async () => {
    if (renameRef.current) {
      const newName = renameRef.current.value;
      try {
        await updateProjectName(project.id, newName);
        console.log('프로젝트 이름 업데이트 성공:', newName);
        setProjectName(newName);
      } catch (error) {
        console.error('프로젝트 이름 업데이트 실패:', error);
      } finally {
        handleRename();
      }
    }
  };

  return (
    <>
      <div
        data-project-id={project.id} // 프로젝트 ID 전달
        className={`group folder flex items-center p-[2px] pl-1 cursor-default rounded-[5px] h-[30px] w-full hover:bg-gray-200/65 has-[.popup-menu]:bg-gray-200/65`}>
      {/* 폴더 아이콘 */}
        <div className="basis-[22px] h-[22px] p-[1.8px] hover:bg-gray-300 transition-all cursor-pointer mr-[7px] rounded-[4px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z"></path>
            <path d="M3 10h18"></path>
            <path d="M10 3v18"></path>
          </svg>
        </div>
        {/* 폴더 이름 */}
        { isRename ? (
            <div className="flex-1 rename peer">
              <input
                type="text"
                className="w-full px-[6px] py-[0px] outline-solid outline-gray-400 outline-1 rounded-[3px] bg-white"
                defaultValue={projectName}
                onBlur={handleBlur}
                ref={renameRef}
                onKeyDown={handleKeyDown} />
            </div>
          ) : (
            <span className="relative top-[1px] cursor-pointer min-w-[80px] flex-1" onClick={() => setIsFolded(!isFolded)}>{projectName}</span>
          )
        }

        {/* button wrapper */}
        <div className="relative p-[3px] basis-[50px] items-center hidden group-hover:flex has-[.popup-menu]:flex peer-[.rename]:flex peer-[.rename]:opacity-0 peer-[.rename]:pointer-events-none">
          {/* button - add */}
          <div className="w-[22px] h-[22px] p-[3px] hover:bg-gray-300 rounded-[7px] transition-all cursor-pointer" onClick={(e) => { e.stopPropagation(); }}>
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" strokeWidth="2">
              <path d="M12 5l0 14"></path>
              <path d="M5 12l14 0"></path>
            </svg>
          </div>
          {/* button -setting */}
          <SidebarSettingButton type="project" handleRename={handleRename} />
        </div>
      </div>
      {
        /* 하위 폴더 List */
        !isFolded && project.lists?.map((folder, index) => {
          return <Folder folder={folder} key={index} />
        })
      }
    </>
  );
}