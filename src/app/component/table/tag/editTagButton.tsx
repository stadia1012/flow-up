'use client'
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import EditTagPopup from "./editTagPopup";

export default function EditTagButton({
  tag
}: {
  tag: RowTag
}) {
  // tag popup 열기 여부
  const [isTagPopupOpen, setIsTagPopupOpen] = useState(false);
  const tagPopupRef = useRef<HTMLDivElement>(null);

  // tag popup 위치 조정
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const tagPopupButton = useRef<HTMLDivElement | null>(null);
  const handleEditTagPopup = () => {
    if (!isTagPopupOpen && tagPopupButton.current) {
      // 닫힌 경우 열기 전 popup 위치 조정
      const rect = tagPopupButton.current.getBoundingClientRect();
      // setPopupPos({
      //   top: rect.bottom + window.scrollY, // 하단 기준
      //   left: rect.left + window.scrollX, // 왼쪽 기준
      // });
      const popupWidth = 250; // 팝업 너비
      const popupHeight = 200; // 대략적인 팝업 높이
      
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
      <div onClick={() => handleEditTagPopup()} ref={tagPopupButton}>
        <svg className="w-full h-full relative top-[1px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path></svg>
      </div>
      {isTagPopupOpen && createPortal(
        <EditTagPopup
          tagPopupRef={tagPopupRef}
          setIsTagPopupOpen={setIsTagPopupOpen}
          style={{ top: (popupPos?.top || 0), left: (popupPos?.left || 0) }}
          tag={tag}
        ></EditTagPopup>, document.body
      )}
    </>
    
  )
}