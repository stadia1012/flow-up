'use client'
import { useState, useEffect, useRef } from "react";
import Folder from "./folder";
import ProjectSettingPopup from "./projectSettingPopup";
import ProjectSettingButton from "./projectSettingButton";

export default function Project({project}: {project: List}) {
  const [isFolded, setIsFolded] = useState(project.isFolded); // 폴더 펼치기/접기
  const [isSettingPopupOpen, setIsSettingPopupOpen] = useState(false); // 설정 팝업 열기/닫기
  const buttonRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // 팝업 토글
  const toggleMenu = () => setIsSettingPopupOpen((prev) => !prev);

  // 외부 클릭 감지 로직
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log('handleClickOutside');
      const target = event.target as Node;
      const isOutsidePopup = popupRef.current && !popupRef.current.contains(target);
      const isOutsideButton = buttonRef.current && !buttonRef.current.contains(target);
      
      if (isSettingPopupOpen && isOutsidePopup && isOutsideButton) {
        setIsSettingPopupOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isSettingPopupOpen]);

  return (
    <>
    <div className={`group folder flex items-center p-[2px] pl-1 cursor-default hover:bg-gray-200/65 rounded-[5px] h-[30px]`}>
      {/* 폴더 아이콘 */}
      <div className="w-[22px] h-[22px] p-[1.8px] hover:bg-gray-300 transition-all cursor-pointer mr-[7px] rounded-[4px]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
          <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z"></path>
          <path d="M3 10h18"></path>
          <path d="M10 3v18"></path>
        </svg>
      </div>
      {/* 폴더 이름 */}
      <span className="relative top-[1px] cursor-pointer min-w-[80px]" onClick={() => setIsFolded(!isFolded)}>{project.name}</span>
      {/* 버튼 */}
      <div className="flex relative p-[3px] ml-auto items-center hidden group-hover:flex">
        {/* 추가 버튼 */}
        <div className="w-[22px] h-[22px] p-[3px] hover:bg-gray-300 rounded-[7px] transition-all cursor-pointer" onClick={(e) => { e.stopPropagation(); }}>
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" strokeWidth="2">
            <path d="M12 5l0 14"></path>
            <path d="M5 12l14 0"></path>
          </svg>
        </div>
        {/* 설정 버튼 */}
        <ProjectSettingButton ref={buttonRef} onClick={toggleMenu} isPopupOpen={isSettingPopupOpen}>
          <ProjectSettingPopup ref={popupRef} />
        </ProjectSettingButton>
      </div>
    </div>
    {
      /* 하위 폴더 List */
      !isFolded &&
      <> {
        project.lists?.map((folder, index) => {
          return <Folder folder={folder} key={index} />
        })
      } </>
    }
    </>
  );
}