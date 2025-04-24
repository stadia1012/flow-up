'use client'
import { useState, useRef, useEffect } from "react";
import SidebarSettingButton from "./sidebarSettingButton";
import { updateListName } from '@/app/controllers/projectController';
import { useDispatch } from "react-redux";
import { setNameState }  from "@/app/store/projectsSlice";
import type { AppDispatch } from "@/app/store/store";

export default function Item({item}: {item: List}) {
  const dispatch: AppDispatch = useDispatch();
  const [isRename, setIsRename] = useState(false); // 이름변경 모드 여부
  const [itemName, setItemName] = useState(item.name); // 이름 state
  const renameRef = useRef<HTMLInputElement>(null); // 이름변경 input ref

  // item 업데이트 시 
  useEffect(() => {
    if (item) {
      setItemName(item.name);
    }
  }, [item]);

  useEffect(() => {
    if (isRename && renameRef.current) {
      renameRef.current.focus();
    }
  }, [isRename]);

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
      renameRef.current.value = itemName; // 원복
    }
  }
    
  // 이름 변경
  const handleBlur = async () => {
    if (renameRef.current) {
      const newName = renameRef.current.value;
      try {
        // DB 변경
        await updateListName({
          id: item.id,
          newName: newName,
          type: 'item'
        });
        // redux 변경 (화면 자동반영)
        dispatch(setNameState({
          id: item.id,
          newName: newName,
          type: 'item'
        }));
      } catch (error) {
        console.error('프로젝트 이름 업데이트 실패:', error);
      } finally {
        handleRename();
      }
    }
  };

  return (
    <div className="group flex items-center p-[2px] pl-6.5 cursor-pointer rounded-[5px] h-[30px] hover:bg-[#ecedf1] has-[.popup-menu]:bg-[#ecedf1]">
      {/* 아이템 아이콘 */}
      <div className="w-[22px] h-[22px] p-[2.3px] hover:bg-gray-300 transition-all mr-[7px] rounded-[4px]">
        <svg style={{color: `${item.iconColor}`}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
          <path d="M9 6l11 0"></path>
          <path d="M9 12l11 0"></path>
          <path d="M9 18l11 0"></path>
          <path d="M5 6l0 .01"></path>
          <path d="M5 12l0 .01"></path>
          <path d="M5 18l0 .01"></path>
        </svg>
      </div>
      {/* 아이템 이름 */}
      { isRename ? ( /* 이름변경 시 */
          <div className="flex-1 rename peer">
            <input
              type="text"
              className="w-full px-[6px] py-[0px] outline-solid outline-gray-400 outline-1 rounded-[3px] bg-white"
              defaultValue={itemName}
              onBlur={handleBlur}
              ref={renameRef}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        ) : (
          <span className="relative top-[1px] cursor-pointer min-w-[80px] flex-1">{itemName}</span>
        )
      }
      {/* button wrapper */}
      <div className="flex p-[3px] ml-auto items-center hidden group-hover:flex has-[.popup-menu]:flex">
        <SidebarSettingButton type="item" handleRename={handleRename} />
      </div>
    </div>
  );
}