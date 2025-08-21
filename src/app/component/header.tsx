'use client'
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // popup 위치 조정
  const popupRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);

  const handleIsPopupOpen = () => {
    if (!isPopupOpen && profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      setPopupPos({
        top: rect.bottom + window.scrollY, // 하단 기준
        left: rect.left + window.scrollX, // 오른쪽 기준
      });
      setIsPopupOpen(true);
    } else {
      setIsPopupOpen(false);
    }
  }

  // 상단 profile Popup 외부 클릭 감지
    useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!popupRef.current) return;

      const isOutside = !popupRef.current.contains(target);
      if (isOutside) {
        // stop: 현재 팝업만 닫기
        e.stopPropagation();
        e.stopImmediatePropagation();
        setIsPopupOpen(false)
      };
    };

    // 팝업이 열려 있을 때만 이벤트 등록
    if (isPopupOpen) {
      document.addEventListener('click', handleClickOutside, true);
    }
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [isPopupOpen]);
  return (
    <div className="flex bg-blue-500 shadow-md items-center py-[7px] box-border min-h-[53px]">
      <div className="ml-[16px]">
        {/* <h1 className="text-white text-[17px] font-[500]"><span className="">C</span>olla<span className="">B</span>ola<span  className="">T</span>ive</h1> */}
        {/* <h1 className="text-white text-[17px] font-[400]">Flow-up</h1> */}
        <h1 className="text-white text-[16px] font-[500] cursor-pointer" onClick={() => location.href = '/' }>Flow-up</h1>
      </div>
      {/* profile */}
      <div
        className="
          flex items-center  w-max rounded-[5px]
          text-right text-[14px] ml-auto mr-[15px] px-[6px] py-[2px]
          cursor-pointer hover:bg-[#5690ff] transition
          text-white
        "
        onClick={handleIsPopupOpen}
        ref={profileRef}
      >
        {
        session?.user.isAdmin &&
        <div className="mr-[10px] text-yellow-200">
          <span>[Admin]</span>
        </div>
        }
        <div className="leading-[125%]">
          <p>{session?.user.deptName}</p>
          <p>{session?.user.name} {session?.user.rank}</p>
        </div>
        <svg
          className="h-[15px] w-[15px] ml-[5px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6l6 -6" />
        </svg>
      </div>
      {isPopupOpen && createPortal(
        <div
          ref={popupRef}
          className="absolute bg-white p-[10px] px-[12px] rounded-[6px] shadow-[var(--popupShadow)] w-max z-[2]"
          style={{ top: (popupPos?.top || 0), right: "18px" }}
        >
          <ul>
            <li className="cursor-pointer px-[12px] hover:bg-gray-100 transition" onClick={() => signOut()}>로그아웃</li>
          </ul>
        </div>
        , document.body)
      }
    </div>
  );
}