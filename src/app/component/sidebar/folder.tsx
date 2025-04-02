'use client'
import { useState } from "react";
import Item from "./item";
import SidebarSettingButton from "./sidebarSettingButton";

export default function Folder({folder}: {folder: List}) {
  const [isFolded, setIsFolded] = useState(folder.isFolded);
  let state = isFolded ? "folded" : "unfolded";

  return (
    <>
    <div className={`group folder ${state} flex items-center p-[2px] pl-4 cursor-default  rounded-[5px] h-[30px] hover:bg-gray-200/65 has-[.popup-menu]:bg-gray-200/65`}>
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
      <span className="relative top-[1px] cursor-pointer" onClick={() => setIsFolded(!isFolded)}>{folder.name}</span>
      {/* button wrapper */}
      <div className="p-[3px] ml-auto items-center hidden group-hover:flex has-[.popup-menu]:flex">
        {/* button - add */}
        <div className="w-[22px] h-[22px] p-[3px] hover:bg-gray-300 rounded-[7px] transition-all cursor-pointer" onClick={(e) => { e.stopPropagation(); }}>
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" strokeWidth="2">
            <path d="M12 5l0 14"></path>
            <path d="M5 12l14 0"></path>
          </svg>
        </div>
        {/* button - add */}
        <SidebarSettingButton type="folder" />
      </div>
    </div>
    {!isFolded &&
      <> {
          folder.lists?.map((list, index) => {
            return <Item item={list} key={index} />
          })
      } </>
    }
    </>
  );
}