'use client'
import { MouseEvent, useEffect, useRef, useState } from "react";
import { useToast } from '@/app/context/ToastContext';
import { searchRowsFromDB } from "@/app/controllers/taskController";
import { SearchedResult } from "@/global";
import SearchedRow from "./searchedRow";

export default function SearchPopup({
  rows,
  itemId,
  setIsSearchPopupOpen
}: {
  rows: TaskRow[],
  itemId: number,
  setIsSearchPopupOpen: (isOpen: boolean) => void
}) {
  const { showToast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 자동 focus
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const [searchedResults, setSearchedResults] = useState<SearchedResult[]>([]);

  // popup 외부 클릭 시 팝업 종료
  const handleClickOutside = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsSearchPopupOpen(false);
  };

  // enter 감지
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  // 검색 처리
  const handleSearch = () => {
    const keyword = searchInputRef.current?.value.trim();
    if (keyword) {
      searchRowsFromDB(keyword).then((res) => {
        setSearchedResults(res);
      });
    } else {
      showToast('검색어를 입력해주세요.', 'error');
      searchInputRef.current!.focus();
    }
  }
  return (
    <div
      className="flex justify-center fixed z-100 h-full w-full top-0 left-0"
      onClick={(e) => handleClickOutside(e)}
    >
      <div
        className="absolute bg-white rounded-[6px] shadow-[var(--popupShadow)] cursor-default z-100 popup-menu w-[900px] h-[560px] top-[100px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 검색어 입력 영역 */}
        <div className="flex py-[10px] px-[15px] border-b border-gray-300">
          <input
            ref={searchInputRef}
            type="text"
            className="
              outline-none text-[14px] text-left
              w-full border border-gray-300 focus:border-blue-400
              rounded-[8px] px-[10px] py-[4px] transition
            "
            placeholder="Search name or content..."
            autoComplete="off"
            spellCheck="false"
            maxLength={50}
            onKeyDown={handleKeyDown}
          ></input>
          <button
            type="button"
            className="
              ml-[10px] flex items-center
              bg-white border border-blue-400 hover:bg-blue-100 text-blue-500
              pl-[7px] pr-[7px] rounded-[4px] transition
            "
            onClick={handleSearch}
          >
            <svg
              className='relative mr-[0px] top-[0px] w-[15px] h-[15px]' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            >
              <path d="M18 6v6a3 3 0 0 1 -3 3h-10l4 -4m0 8l-4 -4"></path>
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto h-[490px] scroll-8px ml-[15px] mr-[8px] my-[5px]">
          {/* 검색 결과 영역 */}
          {searchedResults.length === 0 ? (
            <p className="text-gray-500 text-center mt-[50px]">No results found.</p>
          ) : (
            <ul>
              {searchedResults.map((result) => (
                <SearchedRow
                  key={result.rowId}
                  rows={rows}
                  itemId={itemId}
                  result={result}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}