import { Ref } from 'react';

interface SidebarSettingPopupProps {
  popupRef: Ref<HTMLDivElement>;
  type: string;
  handleRename?: () => void;
  setIsPopupOpen: (isOpen: boolean) => void;
}

export default function SidebarSettingPopup({popupRef, type, handleRename, setIsPopupOpen} : SidebarSettingPopupProps) {
  return (
    <div className="absolute bg-white p-[10px] pl-[7px] pr-[7px] rounded-[6px] shadow-[var(--popupShadow)] cursor-default z-3 popup-menu" ref={popupRef} onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center hover:bg-gray-200/65 rounded-[4px] p-[8px] pt-[3px] pb-[3px] cursor-pointer" style={{transition:'background-color 0.15s'}}>
        {/* 설정 아이콘 */}
        <div className="relative top-[-1px] w-[19px] h-[19px] mr-[8px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"></path>
            <path d="M13.5 6.5l4 4"></path>
          </svg>
        </div>
        {/* 설정 이름 */}
        <div className="w-[100px]" onClick={(e) => {
          e.stopPropagation();
          handleRename?.();
          setIsPopupOpen(false);
        }}>이름 변경</div>
      </div>
      {type !== 'project' && <div className="flex items-center hover:bg-gray-200/65 rounded-[4px] p-[8px] pt-[3px] pb-[3px] cursor-pointer">
        {/* 설정 아이콘 */}
        <div className="relative top-[-1px] w-[19px] h-[19px] mr-[8px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
            <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
            <path d="M9 15h6"></path>
            <path d="M12.5 17.5l2.5 -2.5l-2.5 -2.5"></path>
          </svg>
        </div>
        {/* 설정 이름 */}
        <div className="w-[100px]">이동</div>
      </div> }
      <div className="flex items-center hover:bg-gray-200/65 rounded-[4px] p-[8px] pt-[3px] pb-[3px] cursor-pointer">
        {/* 설정 아이콘 */}
        <div className="relative top-[-1px] w-[19px] h-[19px] mr-[8px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M4 7l16 0"></path>
            <path d="M10 11l0 6"></path>
            <path d="M14 11l0 6"></path>
            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
          </svg>
        </div>
        {/* 설정 이름 */}
        <div className="w-[100px]">삭제</div>
      </div>
    </div>
  );
}