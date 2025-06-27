'use client'
import { useEffect, useState, useRef } from 'react'
import ItemTableCell from './itemTableCell';
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { attachClosestEdge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { DropRowIndicator } from "./dropRowIndicator";

type DragState =
  | { type: "idle"; closestEdge?: any }
  | { type: "dragging-over"; closestEdge: ReturnType<typeof extractClosestEdge> }

type ItemTableRowProps = {
  row: TaskRow,
  fields: TaskField[],
  checkedIds: Set<number>,
  handleCheckbox: React.MouseEventHandler<HTMLSpanElement>,
  updateValue: ({rowId, fieldId, value} : {rowId: number, fieldId: number, value: string}) => void
}

export default function ItemTableRow({
  row, fields, checkedIds, handleCheckbox, updateValue
} : ItemTableRowProps) {
  // drag 요소
  const dragRef = useRef<HTMLTableRowElement | null>(null);
  const [dragState, setDragState] = useState<DragState>({ type: "idle" });
  const [isDragging, setIsDragging] = useState(false);

  // 드래그 앤 드롭 - 드래그
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
            return { rowId: row.rowId, order: row.order };
          },
        }),
        // 개별 항목에 dropTarget 등록
        dropTargetForElements({
          element,
          canDrop({ source }) {
            // 자신에게 드롭 방지
            if (source.element === element) return false;
            return source.data != null && "rowId" in source.data;
          },
          getData({ input }) {
            // drop 시 targetData
            return attachClosestEdge({ rowId: row.rowId, order: row.order }, { element, input, allowedEdges: ["top", "bottom"] });
          },
          getIsSticky() {
            return true;
          },
          onDragEnter({ self, source }) {
            if ("rowId" in source.data) {
              const closestEdge = extractClosestEdge(self.data);
              setDragState({ type: "dragging-over", closestEdge });
            }
          },
          onDrag({ self, source }) {
            if ("rowId" in source.data) {
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
    }, [row]);
  return (
    <>
    {/* 드래그 인디케이터 */}
    {dragState.type === "dragging-over" && dragState.closestEdge === 'top' && (
      <DropRowIndicator edge="top" gap="0px" />
    )}
    <tr
      key={row.rowId}
      ref={dragRef}
      data-row-id={row.rowId}
      data-order={row.order}
      className={`relative group hover:bg-[#fbfbfc] transition
        ${isDragging ? 'dragging' : ''}
        border-b border-gray-200/95
      `}
    >
      <td className={`${checkedIds.has(row.rowId) ? 'border-b border-t border-blue-400 bg-[#edf4fe]' : 'bg-white'} sticky left-[-5px]`}>
        <button className={`relative invisible group-hover:visible top-[2px] pl-[2px] pr-[4px] cursor-move hover:bg-gray-200/50 transition`} onMouseEnter={() => setIsDragging(true)} onMouseLeave={() => setIsDragging(false)} draggable="false">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" strokeWidth="1">
            <path d="M9 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
            <path d="M9 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
            <path d="M9 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
            <path d="M15 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
            <path d="M15 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
            <path d="M15 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
          </svg>
        </button>
      </td>
      <td className={`${checkedIds.has(row.rowId) ? 'border-b border-t border-blue-400 bg-[#edf4fe]' : 'bg-white'} sticky left-[15px]`}>
        <span
          role="checkbox"
          aria-checked={checkedIds.has(row.rowId)}
          tabIndex={0}
          data-id={row.rowId}
          onClick={handleCheckbox}
          onKeyDown={e => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handleCheckbox(e as any);
            }
          }}
          className={`
            inline-block relative invisible group-hover:visible
            w-[14px] h-[14px] top-[-3px] mr-[5px]
            border rounded-[2px]
            text-center
            select-none cursor-pointer
            ${checkedIds.has(row.rowId)
              ? 'bg-blue-500 text-white border-blue-500 visible _checked'
              : 'bg-transparent text-transparent border-gray-400'}
          `}
        >
          <span className='block relative top-[2px] text-[9px] font-[400] leading-[100%]'>✔</span>
        </span>
      </td>
      {[...fields].sort((a, b) => (a.order) - (b.order)).map((field) => (
        <td
          key={field.fieldId}
          className={`
            ${field.type === "name" ? 'sticky left-[40px] z-1' : ''}
            ${checkedIds.has(row.rowId) ? 'border-b border-t border-blue-400 bg-[#edf4fe]' 
              : field.type === "name" ? 'bg-white' : ''}
          `}
        >
          <ItemTableCell
            updateValue={updateValue}
            rowId={row.rowId}
            field={field}
            value={row.values[field.fieldId]}
          />
        </td>
      ))}
      <td className={`${checkedIds.has(row.rowId) && 'border-b border-t border-blue-400 bg-blue-100/50'}`}></td>
    </tr>
    {/* 드래그 인디케이터 */}
    {dragState.type === "dragging-over" && dragState.closestEdge === 'bottom' && (
      <DropRowIndicator edge="bottom" gap="0px" />
    )}
    </>
  );
}