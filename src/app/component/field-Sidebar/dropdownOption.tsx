import { useState, useEffect, useRef } from "react";
import ColorPicker from "@/app/component/colorPicker";
import ColorPanel from "@/app/component/colorPanel";
import { createPortal } from "react-dom";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { attachClosestEdge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { DropOptionIndicator } from "./dropOptionIndicator";

export default function DropdownOption (
  {
    option,
    deleteOption,
    tabIdx
  } : {
    option: DropdownOption,
    deleteOption: (option: DropdownOption) => void,
    tabIdx: number
  }) {
  const optionNamRef = useRef<HTMLInputElement>(null);
  const [isColorPopupOpen, setIsColorPopupOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const applyColor = (color: string) => {
    setIsColorPopupOpen(false);
    option.color = color;
  }
  // colorPopup 외부 클릭 감지
  const colorPopupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!colorPopupRef.current) return;

      const isOutside = !colorPopupRef.current.contains(target);
      if (isOutside) {
        // 현재 팝업만 닫기
        e.stopPropagation();
        e.stopImmediatePropagation();
        setIsColorPopupOpen(false);
      };
    };

    // 팝업이 열려 있을 때만 이벤트 등록
    if (isColorPopupOpen) {
      document.addEventListener('click', handleClickOutside, true);
    }
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [isColorPopupOpen]);

  // 드래그 앤 드롭 - 드래그
  type DragState =
  | { type: "idle"; closestEdge?: any }
  | { type: "dragging-over"; closestEdge: ReturnType<typeof extractClosestEdge> }
  const dragRef = useRef<HTMLLIElement | null>(null);
  const [dragState, setDragState] = useState<DragState>({ type: "idle" });
  useEffect(() => {
    const element = dragRef.current;
    if (!element) return;

    return combine(
      // 드래그 시 sourceData
      draggable({
        element: element,
        canDrag({ element }) {
          if (!element.classList.contains('dragging')) {
            return false;
          }
          return true;
        },
        getInitialData() {
          return { optionId: option.id, order: option.order };
        },
      }),
      // 개별 항목에 dropTarget 등록
      dropTargetForElements({
        element,
        canDrop({ source }) {
          // 자신에게 드롭 방지
          if (source.element === element) return false;
          return source.data != null && "optionId" in source.data;
        },
        getData({ input }) {
          // drop 시 targetData
          return attachClosestEdge({ optionId: option.id, order: option.order }, { element, input, allowedEdges: ["top", "bottom"] });
        },
        getIsSticky() {
          return true;
        },
        onDragEnter({ self, source }) {
          if ("optionId" in source.data) {
            const closestEdge = extractClosestEdge(self.data);
            setDragState({ type: "dragging-over", closestEdge });
          }
        },
        onDrag({ self, source }) {
          if ("optionId" in source.data) {
            const closestEdge = extractClosestEdge(self.data);
            setDragState({ type: "dragging-over", closestEdge });
          }
        },
        onDragLeave() {
          setDragState({ type: "idle" });
        },
        onDrop() {
          setDragState({ type: "idle" });
        },
      })
    );
  }, [option]);

  // color popup 위치 조정
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const colorPopupButton = useRef<HTMLDivElement | null>(null);
  const handleColorPopupOpen = () => {
    if (!isColorPopupOpen && colorPopupButton.current) {
      // 닫힌 경우 열기 전 popup 위치 조정
      const rect = colorPopupButton.current.getBoundingClientRect();
      setPopupPos({
        top: rect.bottom + window.scrollY, // 하단 기준
        left: rect.left + window.scrollX, // 왼쪽 기준
      });
    }
    setIsColorPopupOpen(prev => !prev);
  }

  return (
    <div className="relative overflow-visible w-full" data-order={option.order}>
    {/* 드래그 인디케이터 */}
    {dragState.type === "dragging-over" && dragState.closestEdge === 'top' && (
      <DropOptionIndicator edge="top" gap="0px" />
    )}
    <li
      data-option-id={option.id} data-li='dropdown-option-list'
      className={`group flex items-center mb-[5px] overflow-overlay
        ${isDragging ? 'dragging' : ''}
      `}
      ref={dragRef}
    > 
      <button className={`flex opacity-0 group-hover:opacity-100 items-center cursor-move hover:bg-gray-200/50 rounded-[2px] transition`} onMouseEnter={() => setIsDragging(true)} onMouseLeave={() => setIsDragging(false)} draggable="false">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" strokeWidth="1">
          <path d="M9 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
          <path d="M9 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
          <path d="M9 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
          <path d="M15 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
          <path d="M15 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
          <path d="M15 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
        </svg>
      </button>
      <div className="flex items-center relative
        border border-gray-300/90 rounded-[5px] hover:border-gray-400
        hover:bg-gray-100/80 py-[3px] px-[8px] transition
        has-[input:focus]:border-blue-500 has-[input:focus]:bg-white mr-[14px] w-full">
        <div ref={colorPopupButton} className="mr-[2px]" onClick={handleColorPopupOpen}>
          <ColorPanel hex={option.color} selected={false} />
          {isColorPopupOpen && createPortal(
            <ColorPicker
              hex={option.color}
              colorPopupRef={colorPopupRef}
              setIsColorPopupOpen={setIsColorPopupOpen}
              applyColor={applyColor}
              style={{ top: (popupPos?.top || 0), left: (popupPos?.left || 0) }}
            />, document.body
          )
          }
        </div>
        <input
          type="text"
          data-input="optionName"
          ref={optionNamRef}
          className="outline-none"
          defaultValue={option.name}
          placeholder="Type option"
          data-tab-idx={tabIdx}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            if (e.key === 'Tab') {
              e.preventDefault();
              (document.querySelector(`input[data-tab-idx='${tabIdx + 1}']`) as HTMLInputElement)?.focus();
            }
          }}
          maxLength={50}
          onChange={(e) => option.name = (e.target as HTMLInputElement).value}
        />
        {/* 삭제 버튼 */}
        <button
          type="button" className="ml-auto flex opacity-0 group-hover:opacity-100 items-center justify-center cursor-pointer p-[2px] rounded-[3px] hover:bg-gray-200/65 transition"
          onClick={(e) => {
            e.stopPropagation();
            deleteOption(option);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#000000"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7l16 0" />
            <path d="M10 11l0 6" />
            <path d="M14 11l0 6" />
            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
          </svg>
        </button>
      </div>
    </li>
    {/* 드래그 인디케이터 */}
    {dragState.type === "dragging-over" && dragState.closestEdge === 'bottom' && (
      <DropOptionIndicator edge="bottom" gap="0px" />
    )}
    </div>
  )
}