'use client'
import { useState, useRef, useEffect } from "react";
import SidebarSettingButton from "./sidebarSettingButton";
import { updateListName } from '@/app/controllers/projectController';
import { useDispatch } from "react-redux";
import { setIsFoldedState, setNameState }  from "@/app/store/projectsSlice";
import type { AppDispatch } from "@/app/store/store";
import DraggableItem from "./draggableItem";

export default function Folder({folder, dragStateType}: {folder: List, dragStateType: string}) {
  const dispatch: AppDispatch = useDispatch();
  const [isFolded, setIsFolded] = useState(folder.isFolded);
  const [isRename, setIsRename] = useState(false); // 이름변경 모드 여부
  const [folderName, setFolderName] = useState(folder ? folder.name : ""); // 이름 state
  let state = isFolded ? "folded" : "unfolded";
  const renameRef = useRef<HTMLInputElement>(null); // 이름변경 input ref
  const [items, setItems] = useState(folder ? folder.lists : []); // 하위 폴더들
  const containerRef = useRef<HTMLDivElement | null>(null);

  // folder 업데이트 시 
  useEffect(() => {
    if (folder) {
      setFolderName(folder.name);
      setItems(folder.lists);
    }
  }, [folder]);

  useEffect(() => {
    if (isRename && renameRef.current) {
      renameRef.current.focus();
    }
  }, [isRename]);

  // fold 상태 변경 시 redux에 업데이트
  const handleIsFolded = () => {
    setIsFolded(prev => !prev);
    dispatch(setIsFoldedState({
      type: 'folder',
      folderId: folder.id,
      isFolded: !isFolded
    }));
  }
  
  const handleRename = () => {
    setIsRename(prev => !prev);
  }
  // 이름변경 input에서 Enter키 입력 시
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
    if (e.key === "Escape") {
      if (!renameRef.current) return;
      handleRename();
      renameRef.current.value = folderName; // 원복
    }
  }
  
  // 이름 변경
  const handleBlur = async () => {
    if (renameRef.current) {
      const newName = renameRef.current.value;
      try {
        // DB 변경
        await updateListName({
          id: folder.id,
          newName: newName,
          type: 'folder'
        });
        // 화면 변경
        setFolderName(newName);
        // redux 변경
        setNameState({
          id: folder.id,
          newName: newName,
          type: 'folder'
        })
      } catch (error) {
        console.error('프로젝트 이름 업데이트 실패:', error);
      } finally {
        handleRename();
      }
    }
  };

  return (
    <div ref={containerRef}>
      <div
        className={`group folder ${state} flex items-center p-[2px] pl-4 cursor-default rounded-[5px] h-[30px] hover:bg-[#ecedf1] has-[.popup-menu]:bg-[#ecedf1] ${dragStateType === "dragging-folder-over" ? "bg-blue-100/70" : ""}`}>
        {/* 폴더 아이콘 */}
        <div className="w-[23px] h-[23px] p-[1.8px] hover:bg-gray-300 transition-all cursor-pointer mr-[8px] rounded-[4px]">
          {/* 폴더 아이콘 [foled] */}
          <svg className="ic_folded group-[.folded]:block group-[.unfolded]:hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2"></path>
          </svg>
          {/* 폴더 아이콘 [unfoled] */}
          <svg className="ic_unfolded group-[.folded]:hidden group-[.unfolded]:block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M5 19l2.757 -7.351a1 1 0 0 1 .936 -.649h12.307a1 1 0 0 1 .986 1.164l-.996 5.211a2 2 0 0 1 -1.964 1.625h-14.026a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v2"></path>
          </svg>
        </div>
        {/* 폴더 이름 */}
        { isRename ? ( /* 이름변경 시 */
          <div className="flex-1 rename peer">
            <input
              type="text"
              className="w-full px-[6px] py-[0px] outline-solid outline-gray-400 outline-1 rounded-[3px] bg-white"
              defaultValue={folderName}
              onBlur={handleBlur}
              ref={renameRef}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck="false"
              />
          </div>
        ) : (
          <span className="relative top-[1px] cursor-pointer min-w-[80px] flex-1" onClick={handleIsFolded}>{folderName}</span>
        )
      }
      {/* button wrapper */}
      <div className="p-[3px] ml-auto items-center hidden group-hover:flex has-[.popup-menu]:flex">
        {/* button - add */}
        <div className="w-[22px] h-[22px] p-[3px] hover:bg-gray-300 rounded-[7px] transition-all cursor-pointer" onClick={(e) => { e.stopPropagation(); }}>
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" strokeWidth="2">
            <path d="M12 5l0 14"></path>
            <path d="M5 12l14 0"></path>
          </svg>
        </div>
        {/* button - setting */}
        <SidebarSettingButton type="folder" handleRename={handleRename} />
      </div>
    </div>
    {
      /* 하위 Item List */
      !isFolded && <div className="relative">
        {items?.map((item) => (
          <DraggableItem key={item.id} item={item} />
        ))}
      </div>
    }
    </div>
  );
}