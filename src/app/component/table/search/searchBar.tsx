'use client'
import { useState } from "react";
import { createPortal } from "react-dom";
import SearchPopup from "./searchPopup";

export default function SearchBar({
  rows,
  item
}: {
  rows: TaskRow[],
  item: List
}) {
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  return (
    <>
      <div
        className="
          flex items-center absolute top-[11px] w-[350px] h-[30px] bg-white rounded-[14px] pl-[15px] cursor-pointer hover:shadow-[var(--popupShadow)] transition
          translate-x-[-50%] left-[50%] z-50
        "
        onClick={() => setIsSearchPopupOpen(prev => !prev)}
      >
        <svg
          className="relative h-[14px] w-[14px] mr-[3px] top-[1px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path><path d="M21 21l-6 -6"></path>
        </svg>
        <span className="relative text-gray-500/90 text-[13px] font-[500] top-[1px]">Search</span>
      </div>
      {
        isSearchPopupOpen && createPortal(
          <SearchPopup rows={rows} itemId={item.id} setIsSearchPopupOpen={setIsSearchPopupOpen} />,
          document.body
        )
      }
    </>
  );
}