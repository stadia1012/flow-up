'use client'
import { updateFieldWidth } from "@/app/controllers/taskController";
import { useState, useEffect, useRef } from "react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { attachClosestEdge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { DropHeadIndicator } from "./dropHeadIndicator";
import { createPortal } from "react-dom";
import FieldSettingsPopup from "./fieldSettingsPopup";
import FieldSidebarWrapper from "../field-Sidebar/fieldSidebarWrapper";
import { DropThIndicator } from "./dropThIndicator";
export default function ItemTableHead({field, fields}: {
  field: TaskField,
  fields: TaskField[]
}) {
  const [width, setWidth] = useState(field.width);
  const isResizing = useRef(false);
  const thRef = useRef<HTMLTableCellElement>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null); // popup 위치

  // sidebar
  const [isMountSidebar, setIsMountSidebar] = useState(false);
  const [closeSidebar, setCloseSidebar] = useState(false); // 닫기

  // 마우스로 width 조절
  useEffect(() => {
    function handleMouseMove(e: React.MouseEvent<Document>) {
      if (!isResizing.current || !thRef.current) return;
      const newWidth = e.clientX - thRef.current.getBoundingClientRect().left;
      setWidth(Math.max(100, Math.min(newWidth, 600))); // 최소 200, 최대 600 제한
    }
    function handleMouseUp() {
      if (isResizing.current) {
        // DB 저장
        const newWidth = parseInt(thRef.current?.style.width || '200');
        updateFieldWidth({fieldId: field.fieldId, width: newWidth});
      }
      isResizing.current = false;
      document.body.style.cursor = "";
    }
    
    document.addEventListener("mousemove", handleMouseMove as any);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove as any);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing.current]);

  // setting popup 외부 클릭 감지
  const popupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!popupRef.current) return;

      const isOutside = !popupRef.current.contains(target);
      console.log(isOutside, 'isOutside')
      if (isOutside) {
        // 현재 팝업만 닫기
        e.stopPropagation();
        e.stopImmediatePropagation();
        setIsPopupOpen(false);
      };
    };

    // 팝업이 열려 있을 때만 이벤트 등록
    if (isPopupOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isPopupOpen]);

  // sidebar 외부 클릭 감지
  const sidebarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!sidebarRef.current) return;

      const isOutside = !sidebarRef.current.contains(target);
      if (isOutside) {
        // 현재 팝업만 닫기
        e.stopPropagation();
        e.stopImmediatePropagation();
        setCloseSidebar(true);
      };
    };

    // 팝업이 열려 있을 때만 이벤트 등록
    if (isMountSidebar) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMountSidebar]);

  // popup 위치 조정
  const handleIsPopupOpen = () => {
    if (!isPopupOpen && thRef.current) {
      const rect = thRef.current.getBoundingClientRect();
      setPopupPos({
        top: rect.bottom + window.scrollY, // 하단 기준
        left: rect.left + window.scrollX, // 왼쪽 기준
      });
      setIsPopupOpen(true);
    } else {
      setIsPopupOpen(false);
    }
  }

  // 드래그 앤 드롭 - 드래그
  type DragState =
  | { type: "idle"; closestEdge?: any }
  | { type: "dragging-over"; closestEdge: ReturnType<typeof extractClosestEdge> }
  const [dragState, setDragState] = useState<DragState>({ type: "idle" });
  
  useEffect(() => {
    const element = thRef.current;
    if (!element) return;

    return combine(
      // 드래그 시 sourceData
      draggable({
        element: element,
        canDrag({ element }) {
          if (element.dataset.fieldId === '1') {
            return false;
          }
          return true;
        },
        getInitialData() {
          return { fieldId: field.fieldId, order: field.order };
        },
      }),
      // 개별 항목에 dropTarget 등록
      dropTargetForElements({
        element,
        canDrop({ source }) {
          // 자신에게 드롭 방지
          if (source.element === element) return false;
          return source.data != null && "fieldId" in source.data;
        },
        getData({ input }) {
          // drop 시 targetData
          return attachClosestEdge({ fieldId: field.fieldId, order: field.order }, { element, input, allowedEdges: ["left", "right"] });
        },
        getIsSticky() {
          return true;
        },
        onDragEnter({ self, source }) {
          if ("fieldId" in source.data) {
            const closestEdge = extractClosestEdge(self.data);
            setDragState({ type: "dragging-over", closestEdge });
          }
        },
        onDrag({ self, source }) {
          if ("fieldId" in source.data) {
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
  }, [field]);

  // 리사이저에서 마우스 누를 때
  const onMouseDown = (e: React.MouseEvent<HTMLTableCellElement>) => {
    isResizing.current = true;
    document.body.style.cursor = "ew-resize";
    e.preventDefault();
  };
  return (
    <>
    <th
      ref={thRef}
      className={`
        relative cursor-pointer hover:bg-[#f3f4f6] transition
        ${field.type == 'name' && 'sticky left-[30px] bg-white z-1'}
      `}
      data-field-id={field.fieldId}
      data-type={field.type}
      style={{
        width: `${width}px`
      }}
      onClick={handleIsPopupOpen}
    >
      {/* 드래그 인디케이터 */}
      {dragState.type === "dragging-over" && dragState.closestEdge === 'left' && (
        <DropThIndicator edge="left" gap="0px" />
      )}
      <div className='flex items-center border-b border-gray-300 pl-[8px] pt-[3px] pb-[3px] text-left text-gray-500 font-[500] text-[13px] h-[32px]'>
        <p className="truncate">{field.name}</p>
      </div>
      {/* 리사이즈 핸들러 */}
      <div
        onMouseDown={onMouseDown}
        className='absolute right-0 top-0 h-full w-[8px] cursor-col-resize select-none border-r-[4px] border-transparent hover:border-blue-300 transition-all'
      />
      {/* 드래그 인디케이터 */}
      {dragState.type === "dragging-over" && dragState.closestEdge === 'right' && (
        <DropThIndicator edge="right" gap="0px" />
      )}
    </th>
    {
      // th 밖에 위치해야 onClick={handleIsPopupOpen}으로 인해 팝업 클릭 시 팝업 닫힘 방지
      isPopupOpen && field.type !== 'name' && createPortal(
        <FieldSettingsPopup
          popupRef={popupRef}
          setIsPopupOpen={setIsPopupOpen}
          popupPos={popupPos}
          field={field}
          fields={fields}
          setIsMountSidebar={setIsMountSidebar}
          setCloseSidebar={setCloseSidebar}
        />, document.body
      )
    }
    {
      isMountSidebar && createPortal(
        <FieldSidebarWrapper
          type={'edit'}
          setIsMountSidebar={setIsMountSidebar}
          field={field}
          sidebarRef={sidebarRef}
          closeSidebar={closeSidebar}
        />
        , document.getElementById("content-container") as Element
      )
    }
    </>
  )
}