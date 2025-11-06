'use client'
import { useRef, useState } from "react";
import AddTagPopup from "./addTagPopup";
import { createPortal } from "react-dom";

export default function AddTagButton({rowId, setShowActions, tagIds, allTags}: {
  rowId: number,
  setShowActions: (arg: boolean) => void,
  tagIds: number[],
  allTags: RowTag[]
}) {
  // tag popup 열기 여부
  const [isTagPopupOpen, setIsTagPopupOpen] = useState(false);
  const tagPopupRef = useRef<HTMLDivElement>(null);

  // tag popup 위치 조정
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const tagPopupButton = useRef<HTMLButtonElement | null>(null);
  const handleTagPopupOpen = () => {
    if (!isTagPopupOpen && tagPopupButton.current) {
      // 닫힌 경우 열기 전 popup 위치 조정
      setShowActions(true);
      const rect = tagPopupButton.current.getBoundingClientRect();
      // setPopupPos({
      //   top: rect.bottom + window.scrollY, // 하단 기준
      //   left: rect.left + window.scrollX, // 왼쪽 기준
      // });
      const popupWidth = 250; // 팝업 너비
      const popupHeight = 95; // 대략적인 팝업 높이
      
      // 뷰포트 크기
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let top = rect.bottom + window.scrollY; // 기본: 셀 아래쪽
      let left = rect.left + window.scrollX; // 기본: 셀 왼쪽 정렬
      
      // 세로 위치 조정: 팝업이 화면 아래로 벗어나는 경우 셀 위쪽에 표시
      if (rect.bottom + popupHeight > viewportHeight) {
        top = rect.top + window.scrollY - popupHeight; // 셀 위쪽에 표시
        
        // 위쪽에 표시해도 화면을 벗어나는 경우
        if (top < window.scrollY) {
          // 화면 상단에서 약간의 여백을 두고 표시
          top = window.scrollY;
        }
      }
      
      // 팝업이 오른쪽으로 벗어나는 경우
      if (rect.left + popupWidth > viewportWidth) {
        left = viewportWidth - popupWidth - 1 + window.scrollX; // 화면 오른쪽 경계에 여백을 두고 표시
      }
      
      // 팝업이 왼쪽으로 벗어나는 경우
      if (left < window.scrollX) {
        left = window.scrollX + 1; // 화면 왼쪽 경계에 여백을 두고 표시
      }

      setPopupPos({ top, left });
    }
    setIsTagPopupOpen(prev => !prev);
  }
  return (
    <>
    <button
      type="button"
      className={`
        flex items-center shrink-0
        basis-[24px] w-[24px] h-[24px] p-[3px] ml-[4px] mr-[0px]
        border border-gray-300 rounded-[4px] cursor-pointer bg-white hover:bg-[#f3f3f3]
      `}
      ref={tagPopupButton}
      onClick={() => {
        handleTagPopupOpen();
      }}
    >
      <span className='relative top-[1px] left-[0.5px] text-[#454545] w-full h-full'>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#000000"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
          <path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3z" />
        </svg>
      </span>
    </button>
    {isTagPopupOpen && createPortal(
    <AddTagPopup
      rowId={rowId}
      allTags={allTags}
      tagIds={tagIds}
      setShowActions={setShowActions}
      tagPopupRef={tagPopupRef}
      setIsTagPopupOpen={setIsTagPopupOpen}
      style={{ top: (popupPos?.top || 0), left: (popupPos?.left || 0) }}
    />, document.body)}
    </>
  );
}