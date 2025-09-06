'use client'
import { useEffect, useState, useRef } from 'react'
import ItemTableCell from './itemTableCell';
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { attachClosestEdge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { DropRowIndicator } from "./dropRowIndicator";
import SubRowInput from './subRowInput';

type DragState =
  | { type: "idle"; closestEdge?: any }
  | { type: "dragging-over"; closestEdge: ReturnType<typeof extractClosestEdge> }

type ItemTableRowProps = {
  itemId: number,
  row: TaskRow,
  rows: TaskRow[],
  parentRow?: TaskRow,
  fields: TaskField[],
  checkedIds: Set<number>,
  handleCheckbox: React.MouseEventHandler<HTMLSpanElement>,
  updateValue: ({row, fieldId, value} : {row: TaskRow, fieldId: number, value: string}) => void
}

export default function ItemTableRow({
  itemId,
  row,
  rows,
  parentRow,
  fields,
  checkedIds,
  handleCheckbox,
  updateValue
} : ItemTableRowProps) {
  // drag 요소
  const dragRef = useRef<HTMLTableRowElement | null>(null);
  const [dragState, setDragState] = useState<DragState>({ type: "idle" });
  const [isDragging, setIsDragging] = useState(false);

  // sub row 관련 state
  const toggleSubRowButton = useRef<HTMLButtonElement>(null); // 토글 버튼
  const addSubRowButton = useRef<HTMLButtonElement>(null); // 토글 버튼
  const [isSubRowOpen, setIsSubRowOpen] = useState(false);
  const [isSubRowInputOpen, setIsSubRowInputOpen] = useState(false); // sub row 입력창
  
  // sub row 입력창 토글
  const toggleSubRowInput = () => {
    setIsSubRowInputOpen(prev => !prev);
  }

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
            return {
              rowId: row.rowId,
              order: row.order,
              level: row.level
            };
          },
        }),
        // 개별 항목에 dropTarget 등록
        dropTargetForElements({
          element,
          canDrop({ source }) {
            // 자신에게 드롭 방지
            if (source.element === element) return false;
            return source.data && "rowId" in source.data;
          },
          getData({ input }) {
            // drop 시 targetData
            return attachClosestEdge(
              { rowId: row.rowId, order: row.order, level: row.level },
              { element, input, allowedEdges: ["top", "bottom"] }
            );
          },
          getIsSticky() {
            return true;
          },
          onDragEnter({ self, source }) {
            if ("rowId" in source.data && source.data.level === row.level) {
              const closestEdge = extractClosestEdge(self.data);
              setDragState({ type: "dragging-over", closestEdge });
            }
          },
          onDrag({ self, source }) {
            if ("rowId" in source.data && source.data.level === row.level) {
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
      data-row-level={row.level}
      data-order={row.order}
      className={`relative group hover:bg-[#fbfbfc] transition
        ${isDragging ? 'dragging' : ''}
        border-b border-gray-200/95
      `}
    >
      {/* drag button */}
      <td className={`
        group-hover:bg-[#fbfbfc]
        ${checkedIds.has(row.rowId)
          ? 'border-b border-t border-blue-400 bg-[#edf4fe]'
          : 'bg-white'} sticky left-[-5px]
      `}>
        <button className={`relative invisible group-hover:visible top-[3px] pl-[2px] pr-[4px] cursor-move hover:bg-gray-200/50 transition`} onMouseEnter={() => setIsDragging(true)} onMouseLeave={() => setIsDragging(false)} draggable="false">
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
      {/* checkbox */}
      <td className={`
        group-hover:bg-[#fbfbfc]
        ${checkedIds.has(row.rowId)
          ? 'border-b border-t border-blue-400 bg-[#edf4fe]'
          : 'bg-white'}
          sticky left-[15px]
      `}>
        {/* row level 0만 체크박스 표시 */}
        {row.level === 0
            ? (
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
                w-[14px] h-[14px] top-[-2px] mr-[5px]
                border rounded-[2px]
                text-center
                select-none cursor-pointer
                ${checkedIds.has(row.rowId)
                  ? 'bg-blue-500 text-white border-blue-500 visible _checked'
                  : 'bg-transparent text-transparent border-gray-400'}
              `}
            >
              <span className='block relative top-[2px] text-[9px] font-[400] leading-[100%]'>✔</span>
            </span>)
            : ''}
      </td>
      {[...fields].sort((a, b) => (a.order) - (b.order)).map((field) => (
        <td
          key={field.fieldId}
          className={`
            group-hover:bg-[#fbfbfc]
            ${field.type === "name" ? 'sticky left-[39px] z-1' : ''}
            ${checkedIds.has(row.rowId) ? 'border-b border-t border-blue-400 bg-[#edf4fe]' 
              : field.type === "name" ? 'bg-white' : ''}
          `}
        >
          <ItemTableCell
            updateValue={updateValue}
            row={row}
            field={field}
            value={row.values[field.fieldId]}
            parentRow={parentRow}
            isSubRowOpen={isSubRowOpen}
            setIsSubRowOpen={setIsSubRowOpen}
            toggleSubRowButton={toggleSubRowButton}
            addSubRowButton={addSubRowButton}
            toggleSubRowInput={toggleSubRowInput}
            setIsSubRowInputOpen={setIsSubRowInputOpen}
          />
        </td>
      ))}
      <td className={`${checkedIds.has(row.rowId) && 'border-b border-t border-blue-400 bg-blue-100/50'}`}></td>
    </tr>
    {/* 드래그 인디케이터 */}
    {dragState.type === "dragging-over" && dragState.closestEdge === 'bottom' && (
      <DropRowIndicator edge="bottom" gap="0px" />
    )}
    {
      isSubRowOpen && row.subRows && (
        [...row.subRows].sort((a, b) => (a.order) - (b.order)).map((sub)  => (
          <ItemTableRow
            key={sub.rowId}
            itemId={itemId}
            row={sub}
            parentRow={row}
            rows={row.subRows!}
            fields={fields}
            checkedIds={checkedIds}
            handleCheckbox={handleCheckbox}
            updateValue={updateValue}
          />
        ))
      )
    }{
      isSubRowOpen && isSubRowInputOpen && (
        <SubRowInput
          itemId={itemId}
          row={row}
          fields={fields}
          setIsSubRowOpen={setIsSubRowOpen}
          setIsSubRowInputOpen={setIsSubRowInputOpen}
          toggleSubRowButton={toggleSubRowButton}
          addSubRowButton={addSubRowButton}
        />
      )
    }
    </>
  );
}