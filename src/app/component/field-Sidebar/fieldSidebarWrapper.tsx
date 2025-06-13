'use client'
import { useEffect, useState } from "react";
import EditFieldSidebar from "./editFieldSidebar";
import AddFieldSidebar from "./addFieldSidebar";

export default function FieldSidebarWrapper(
  {type, setIsMountSidebar, itemId, field, sidebarRef, closeSidebar}:
  {
    type: 'add' | 'edit',
    setIsMountSidebar: (arg: boolean) => void,
    itemId?: number, // add에서 사용
    field?: TaskField, // edit에서 사용
    sidebarRef: React.RefObject<HTMLDivElement | null>,
    closeSidebar: boolean // true면 닫기, 외부에서 전달
  }
) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // false면 닫기, 내부에서 전달
  const [isShow, setIsShow] = useState(false);
  const [isSlidingIn, setIsSlidingIn] = useState(false);

  // sliding 애니메이션
  useEffect(() => {
    if (isSidebarOpen) {
      setIsShow(true);
      // 확실하게 다음 프레임에 실행
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsSlidingIn(true);
        });
      });
    } else {
      setIsSlidingIn(false);
      setTimeout(() => {
        setIsShow(false);
        setIsMountSidebar(false);
      }, 300);
    }
  }, [isSidebarOpen]);

  // 외부에서 닫기
  useEffect(() => {
    if (closeSidebar) {
      setIsSlidingIn(false);
      setTimeout(() => {
        setIsShow(false);
        setIsMountSidebar(false);
      }, 300);
    }
  }, [closeSidebar]);

  return (
    <div id="field-sidebar-wrapper" ref={sidebarRef}>
      {isShow &&
      <nav
        className={`
          flex flex-col absolute right-[0px] top-[0px] w-[300px]
          bg-white shadow-md
          text-[#46484d] text-[14px]
          border-b-1 border-l-1 border-gray-300/85 h-full box-border
          pt-[15px] transition-all
          transition-all duration-300 ease-in-out
          ${isSlidingIn ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {
          type === 'add' && itemId &&
          <AddFieldSidebar
            setIsSidebarOpen={setIsSidebarOpen}
            itemId={itemId}
          />
        }
        { type === 'edit' && field &&
          <EditFieldSidebar setIsSidebarOpen={setIsSidebarOpen} field={field} /> }
      </nav>
      }
    </div>
  );
}