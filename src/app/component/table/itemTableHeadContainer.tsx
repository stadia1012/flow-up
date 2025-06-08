'use client'
import { flash } from "@/app/animation";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/app/store/store";
import { handleAddFieldSidebar } from "@/app/store/tableSlice";
import ItemTableHead from './itemTableHead';
import { useEffect, useRef } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";

export default function ItemTableHeadContainer({
  fields,
  handleCheckAll,
  isAllChecked,
  itemId
}: {
  fields: TaskField[],
  handleCheckAll: () => void,
  isAllChecked: boolean,
  itemId: number
}) {
  const dispatch: AppDispatch = useDispatch();

  // 드래그 앤 드롭 - 드롭 영역
  const containerRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    return dropTargetForElements({
      element: container,
      canDrop({ source }) {
        return true;
      },
      onDrop({ source, location }) {
        const sourceData = source.data;
        if (!sourceData || !("fieldId" in sourceData) || !("order" in sourceData)) return;

        const target = location.current.dropTargets[0];

        const targetData = target.data;
        if (!targetData || !("fieldId" in targetData) || !("order" in targetData)) return;
        
        console.log(`target:`, target);
        console.log(`source:`, source);

        const targetOrder = Number(targetData.order);
        const closestEdge = extractClosestEdge(targetData);
        let updateOrder = closestEdge === "top" ? targetOrder : targetOrder + 1;

        const newOptions = fields.map((el: any) => ({ ...el }));
        if (updateOrder > Number(sourceData.order)) {
          // 후순서로 이동
          console.log('후순서 이동');
          // 소스 ~ 타켓 order -1
          updateOrder--; // 조정
          newOptions.forEach((el: any) => {
            if (el.order >= sourceData.order! && el.order <= updateOrder) {
              el.order -= 1
            }
          });
        } else {
          // 선순서로 이동
          console.log('선순서 이동');
          // 타겟 ~ 소스 order +1
          newOptions.forEach((el: any) => {
            if (el.order >= updateOrder && el.order <= sourceData.order!) {
              el.order += 1
            }
          });
        }
        // 대상 업데이트

        // 이동 후 flash
        const element = document.querySelector(`[data-field-id="${sourceData.fieldId}"]`);
        if (element) {
          setTimeout(() => {
            flash(element);
          }, 10)
        }
      },
    });
  }, [fields]);
  return (
    <tr className='border-b border-transparent'>
      <th className='w-[20px] sticky left-[-5px] bg-white z-1'>
        {/* drag button field */}
      </th>
      <th data-field="default-check" className="w-[19px] sticky left-[15px] bg-white z-1">
        <span
          role="checkbox"
          tabIndex={0}
          aria-checked={isAllChecked}
          onClick={handleCheckAll}
          onKeyDown={e => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handleCheckAll();
            }
          }}
          className={`
            inline-block
            relative
            w-[14px] h-[14px]
            border rounded-[2px]
            text-center
            select-none
            cursor-pointer
            top-[-3px]
            mr-[5px]
            ${isAllChecked 
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-transparent text-transparent border-gray-400'}
          `}
        >
          <span className='block relative top-[2px] text-[9px] font-[400] leading-[100%]'>✔</span>
        </span>
      </th>
      {[...fields].sort((a, b) => (a.order) - (b.order)).map((field) => (
        <ItemTableHead key={field.fieldId} field={field} fields={fields} />
      ))}
      {/* field 추가 버튼 */}
      <th className='
        sticky right-[-10px]
        text-center text-[#666]
        w-[50px]
        cursor-pointer
        bg-white hover:bg-gray-100
        transition'
        onClick={() => dispatch(handleAddFieldSidebar({itemId}))}
      >
        <div className='flex items-center pl-[14px] border-b border-gray-300 h-[32px]'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="21" height="21" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor">
            <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"></path>
            <path d="M16.1 12h-8.5"></path>
            <path d="M12 7.8v8.7"></path>
          </svg>
        </div>
      </th>
    </tr>
  );
}