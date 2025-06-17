'use client'
import { flash } from "@/app/animation";
import ItemTableHead from './itemTableHead';
import { useEffect, useRef, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { createPortal } from "react-dom";
import FieldSidebarWrapper from "../field-Sidebar/fieldSidebarWrapper";
import { useDispatch, useSelector } from "react-redux";
import { setFields } from "@/app/store/tableSlice";
import { moveTaskField } from "@/app/controllers/taskController";

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
  const dispatch = useDispatch();
  const [isMountSidebar, setIsMountSidebar] = useState(false);
  const [closeSidebar, setCloseSidebar] = useState(false); // 닫기

  // add field sidebar 외부 클릭 감지
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

  // 드래그 앤 드롭 - 드롭 영역
  const containerRef = useRef<HTMLTableRowElement>(null);
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
        let updateOrder = closestEdge === "left" ? targetOrder : targetOrder + 1;
        console.log(closestEdge)

        const newFields = fields.map((el: any) => ({ ...el }));
        if (updateOrder > Number(sourceData.order)) {
          // 후순서로 이동
          console.log('후순서 이동');
          // 소스 ~ 타켓 order -1
          updateOrder--; // 조정
          newFields.forEach((el: any) => {
            if (el.order >= sourceData.order! && el.order <= updateOrder) {
              el.order -= 1
            }
          });
        } else {
          // 선순서로 이동
          console.log('선순서 이동');
          // 타겟 ~ 소스 order +1
          newFields.forEach((el: any) => {
            if (el.order >= updateOrder && el.order <= sourceData.order!) {
              el.order += 1
            }
          });
        }
        // 대상 업데이트
        const sourceRow = newFields.find((el: TaskField) => el.fieldId === sourceData.fieldId);
        if (!sourceRow) return;
        sourceRow.order = updateOrder;

        console.log('updateOrder: ', updateOrder);
        console.log('sourceData.order: ', Number(sourceData.order));
        dispatch(setFields({newFields: [...newFields]}));

        // DB 변경
        moveTaskField({
          fieldId: Number(sourceData.fieldId),
          sourceOrder: Number(sourceData.order),
          updateOrder
        })

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
    <tr className='border-b border-transparent' ref={containerRef}>
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
        w-[50px]
        transition'
        onClick={() => {
          setIsMountSidebar(true);
          setCloseSidebar(false); // 초기화
        }}
      >
        <div className="text-center text-[#666] cursor-pointer bg-white hover:bg-gray-100">
          <div className='flex items-center pl-[14px] border-b border-gray-300 h-[32px]'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="21" height="21" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor">
              <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"></path>
              <path d="M16.1 12h-8.5"></path>
              <path d="M12 7.8v8.7"></path>
            </svg>
          </div>
        </div>
        { /* field sidebar */
          isMountSidebar && createPortal(
            <FieldSidebarWrapper
              type={'add'}
              setIsMountSidebar={setIsMountSidebar}
              itemId={itemId}
              sidebarRef={sidebarRef}
              closeSidebar={closeSidebar}
            />
            , document.getElementById("content-container") as Element
          )
        }
      </th>
    </tr>
  );
}