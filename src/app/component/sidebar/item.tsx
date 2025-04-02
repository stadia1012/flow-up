'use client'
import SidebarSettingButton from "./sidebarSettingButton";
export default function Item({item}: {item: List}) {
  return (
    <div className="group flex items-center p-[2px] pl-6 cursor-pointer rounded-[5px] h-[30px] hover:bg-gray-200/65 has-[.popup-menu]:bg-gray-200/65">
      {/* 폴더 아이콘 */}
      <div className="w-[22px] h-[22px] p-[2.3px] hover:bg-gray-300 transition-all mr-[7px] rounded-[4px]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
          <path d="M9 6l11 0"></path>
          <path d="M9 12l11 0"></path>
          <path d="M9 18l11 0"></path>
          <path d="M5 6l0 .01"></path>
          <path d="M5 12l0 .01"></path>
          <path d="M5 18l0 .01"></path>
        </svg>
      </div>
      {/* 폴더 이름 */}
      <span className="relative top-[1px]">{item.name}</span>
      {/* button wrapper */}
      <div className="flex p-[3px] ml-auto items-center hidden group-hover:flex has-[.popup-menu]:flex">
        <SidebarSettingButton type="item" />
      </div>
    </div>
  );
}