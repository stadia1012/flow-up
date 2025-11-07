'use client'
import { useState, useEffect, useRef, MouseEvent } from "react";
import SidebarAddButton from "./sidebarAddButton";
import SidebarTreeWrapper from "./sidebarTreeWrapper";
import Link from "next/link";
import { Session } from "next-auth";
import { useToast } from "@/app/context/ToastContext";

export default function Sidebar({
  projects,
  session
}: {
  projects: List[],
  session: Session | null
}) {
  const [width, setWidth] = useState(240);
  const isResizing = useRef(false);
  const navRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  

  // 마우스로 width 조절
  useEffect(() => {
    function handleMouseMove(e: MouseEvent<Document>) {
      if (!isResizing.current || !navRef.current) return;
      const newWidth = e.clientX - navRef.current.getBoundingClientRect().left;
      setWidth(Math.max(120, Math.min(newWidth, 600))); // 최소 180, 최대 600 제한
    }
    function handleMouseUp() {
      isResizing.current = false;
      document.body.style.cursor = "";
    }

    document.addEventListener("mousemove", handleMouseMove as any);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove as any);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // 리사이저에서 마우스 누를 때
  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    isResizing.current = true;
    document.body.style.cursor = "ew-resize";
    e.preventDefault();
  };

  return (
    <nav
      ref={navRef}
      className={`
        flex flex-col relative
        bg-gray-50/90 shadow-md
        text-[#46484d] text-[14px] border-b-1 border-r-1 border-gray-300/85 h-full box-border
      `}
      style={{minWidth: `${width}px`}}
    >
      <div className="border-b-1 border-gray-300/85 p-2 pl-2 pt-3 basis-[150px]">
        {
          session?.user.isAdmin
          ? <Link href={{pathname: `/settings`}}>
              <p className="font-[600] cursor-pointer hover:bg-gray-200/65 p-[3px] pl-[15px] rounded-[4px]">Settings</p>
            </Link>
          : <p
              className="font-[600] cursor-pointer hover:bg-gray-200/65 p-[3px] pl-[15px] rounded-[4px]"
              onClick={() => {
                showToast('접근 권한이 없습니다.', 'error')
              }}
            >Settings</p>
        }
        {/* <div className="font-[600] cursor-pointer hover:bg-gray-200/65 p-[3px] pl-[15px] rounded-[4px]">
          <Link  href={{pathname: `/groups`}}>User Groups</Link>
        </div> */}
        {
          session?.user.isAdmin && false // false: 로그 접근 차단
          ? <Link href={{pathname: `/logs`}}>
              <p className="font-[600] cursor-pointer hover:bg-gray-200/65 p-[3px] pl-[15px] rounded-[4px]">Logs</p>
            </Link>
          : <p
              className="font-[600] cursor-pointer hover:bg-gray-200/65 p-[3px] pl-[15px] rounded-[4px]"
              onClick={() => {
                showToast('접근 권한이 없습니다.', 'error')
              }}
            >Logs</p>
        }
      </div>
      <div className="p-2 pr-3">
        <div className="flex">
          <div className="font-[600] pl-2 truncate flex-1 w-[10px]">Workspace</div>
          <div className="ml-auto">
            <SidebarAddButton
              addType="project"
              item={null}
            />
          </div>
        </div>
        <SidebarTreeWrapper initialProjects={projects} />
      </div>
      {/* resizer */}
      <div
        onMouseDown={onMouseDown}
        className="absolute top-0 right-0 h-full w-[4px] cursor-col-resize z-2 hover:bg-blue-100"
      />
    </nav>
  );
}