'use client'
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store/store";
import FieldSidebar from "./editFieldSidebar";

export default function fieldSidebarWrapper() {
  const fieldState = useSelector((state: RootState) => state.table.fieldSidebar);
  const isOpen = fieldState.isOpen;
  const [isMounted, setIsMounted] = useState(false);
  const [isSlidingIn, setIsSlidingIn] = useState(false);

  // sliding 애니메이션
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      // 확실하게 다음 프레임에 실행
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsSlidingIn(true);
        });
      });
    } else {
      setIsSlidingIn(false);
      setTimeout(() => setIsMounted(false), 300);
    }
  }, [isOpen]);

  return (
    <>
      {isMounted &&
      <nav
        className={`
          flex flex-col absolute right-[0px] w-[300px]
          bg-white shadow-md
          text-[#46484d] text-[14px]
          border-b-1 border-l-1 border-gray-300/85 h-full box-border
          pt-[15px] transition-all
          transition-all duration-300 ease-in-out
          ${isSlidingIn ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <FieldSidebar></FieldSidebar>
      </nav>
      }
    </>
  );
}