'use client'
import { Ref } from "react";

type ButtonProps = {
  ref: Ref<HTMLDivElement>;
  onClick: () => void;
  children: React.ReactNode;
  isPopupOpen: boolean;
};

export default function ProjectSettingButton({ref, onClick, children, isPopupOpen}: ButtonProps) {
  return (
    <div className="w-[22px] h-[22px] p-[3px] hover:bg-gray-300 rounded-[7px] transition-all cursor-pointer" ref={ref} onClick={onClick}>
      <svg className="w-full h-full relative top-[1px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" strokeWidth="2">
        <path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
        <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
        <path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
      </svg>
      {isPopupOpen && children}
    </div>
  );
}