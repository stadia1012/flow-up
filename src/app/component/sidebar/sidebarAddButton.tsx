'use client'
import { useState, useEffect, useRef } from "react";
import SidebarAddPopup from "./sidebarAddPopup";

export default function SidebarAddButton({addType}: {addType: ListType}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false); // 설정 팝업 열기/닫기
  const buttonRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지 로직
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!buttonRef.current || !popupRef.current) return;

      const isOutside = 
        !buttonRef.current.contains(target) && 
        !popupRef.current.contains(target);

      if (isOutside) setIsPopupOpen(false);
    };

    // 팝업이 열려 있을 때만 이벤트 등록
    if (isPopupOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isPopupOpen]);

  // 팝업 토글
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPopupOpen(prev => !prev);
  };

  return (
    <>
    <div className="w-[22px] h-[22px] p-[3px] hover:bg-gray-300 rounded-[7px] transition-all cursor-pointer has-[.popup-menu]:bg-gray-300" ref={buttonRef} onClick={(e) => { toggleMenu(e); }}>
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" strokeWidth="2">
        <path d="M12 5l0 14"></path>
        <path d="M5 12l14 0"></path>
      </svg>
      {isPopupOpen && <SidebarAddPopup popupRef={popupRef} addType={addType} setIsPopupOpen={setIsPopupOpen} />}
    </div>
    </>
  );
}