'use client'
import { useState, useRef, useEffect } from 'react'
import DropdownContent from './dropdownContent';
import TextContent from './textContent';
import NameContent from './nameContent';
import NumberContent from './numberContent';
import { useToast } from '@/app/context/ToastContext';
import { showModal } from '../modalUtils';
import { deleteTaskRowFromDB } from '@/app/controllers/taskController';
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/app/store/store";
import { setSubRow } from '@/app/store/tableSlice';

export default function ItemTableCell({
  updateValue,
  row,
  field,
  value,
  parentRow,
  isSubRowOpen,
  setIsSubRowOpen,
  toggleSubRowInput,
  toggleSubRowButton,
  addSubRowButton,
  setIsSubRowInputOpen,
}: { 
  row: TaskRow,
  field: TaskField,
  updateValue: ({row, fieldId, value} : {row: TaskRow, fieldId: number, value: string}) => void,
  value: string,
  parentRow?: TaskRow,
  isSubRowOpen: boolean,
  setIsSubRowOpen: (arg: boolean) => void,
  toggleSubRowInput: () => void,
  toggleSubRowButton: React.RefObject<HTMLButtonElement | null>,
  addSubRowButton: React.RefObject<HTMLButtonElement | null>,
  setIsSubRowInputOpen: (arg: boolean) => void,
}) {
  const dispatch: AppDispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false); // 수정모드
  const containerRef = useRef<HTMLDivElement | null>(null);
  const {showToast} = useToast();
  
  // 값 업데이트
  const handleUpdateValue = ({newValue}: {newValue: string}) => {
    if (newValue !== value) {
      updateValue({
        row: row,
        fieldId: field.fieldId,
        value: newValue
      });
    }
    setIsEditing(false);
  }

  // sub row 삭제
  const handleDeleteSubRow = () => {
    // state update
    const newSubRows = parentRow?.subRows?.filter((subRow) => subRow.rowId !== row.rowId);
    dispatch(setSubRow({
      parentRowId: row.parentId || 0,
      newSubRows: newSubRows || parentRow?.subRows || []
    }));

    // DB update
    deleteTaskRowFromDB({deleteIds: [row.rowId]});
  }

  return (
    <div className={`flex items-center overflow-hidden w-full group`}
      style={{
        ...(row.level !== 0 && field.type === "name" && {
          paddingLeft: 25 + (row.level * 25) + 'px'
        })
      }}
    >
      {/* sub row toggle 버튼 */}
      {field.type === "name" && row.level === 0 && (
        <button
          type="button"
          className={`
            shrink-0 basis-[22px] w-[22px] h-[22px] p-[6.5px] mr-[3px]
            rounded-[4px] cursor-pointer hover:bg-[#f0f0f0]
          `}
          ref={toggleSubRowButton}
          onClick={(e) => {
            setIsSubRowOpen(!isSubRowOpen);

            if (isSubRowOpen) {
              // sub row를 닫을 경우 입력 input도 닫기
              setIsSubRowInputOpen(false);
            }
            
            if (!isSubRowOpen && row.subRows?.length === 0) {
              // sub row input 토글
              toggleSubRowInput();

              // 자동 focus
              setTimeout(() => {
                const subRowInput = document.querySelector(`[data-subrow-parrent='${row.rowId}'] input`) as HTMLInputElement | null;

                subRowInput?.focus();
              }, 10);
            }
          }}
        >
          <span
            className={`
              group-hover:flex items-center relative top-[1px] opacity-[0.6]
              ${isSubRowOpen
                ? 'flex rotate-0 text-[#555555]'
                : (row.subRows && row.subRows?.length !== 0)
                  ? 'flex text-[#888888] rotate-270' // sub row가 있는 경우
                  : 'hidden text-[#888888] rotate-270' // sub row가 없는 경우
              }

            `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.363 20.405l-8.106 -13.534a1.914 1.914 0 0 1 1.636 -2.871h16.214a1.914 1.914 0 0 1 1.636 2.871l-8.106 13.534a1.914 1.914 0 0 1 -3.274 0z" />
            </svg>
          </span>
        </button>
      )}
      <div
        ref={containerRef}
        className={`
          border rounded-[4px] w-full overflow-hidden
          hover:text-blue-600 ${isEditing ? 'border-blue-400 hover:border-blue-400' : 'border-transparent hover:border-gray-300'}
          ${field.type === "dropdown" ? '' : 'pt-[4px] pb-[4px] px-[8px] '}
          h-[32px] box-border
          cursor-pointer
          transition
        `}
        onClick={() => {
          if (!isEditing) {
            // 조회 모드에서 수정모드로 전환

            // 권한 검사
            if (field.type !== 'name' && !field.canEdit) {
              showToast('수정 권한이 없습니다.', 'error');
              return;
            }
            setIsEditing((prev) => !prev);
          }
        }}
      > 
        { // name 인 경우
          (field.type === "name") && 
          <div className='flex items-center'>
            <NameContent
              value={value}
              handleUpdateValue={handleUpdateValue}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
            />
          </div>
        }
        { // text 인 경우
          (field.type === "text") && 
          <TextContent
            field={field}
            value={value}
            handleUpdateValue={handleUpdateValue}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
        }
        { // number 인 경우
          (field.type === "number") && 
          <NumberContent
            field={field}
            value={value}
            handleUpdateValue={handleUpdateValue}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
        }
        { // dropdown 인 경우
          (field.type === "dropdown") && 
          <DropdownContent
            containerRef={containerRef}
            field={field}
            value={value}
            handleUpdateValue={handleUpdateValue}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
        }
      </div>
      {
        /* sub row 추가 버튼 */
        field.type === 'name' && row.level === 0 &&
        <button
          ref={addSubRowButton}
          type="button"
          className={`
            group-hover:flex hidden items-center shrink-0
            basis-[22px] w-[22px] h-[22px] p-[3px] mx-[4px]
            border border-gray-300 rounded-[4px] cursor-pointer hover:bg-[#f3f3f3]
          `}
          onClick={() => {
            if (!isSubRowOpen) {
              setIsSubRowOpen(true);
            }
            // sub row 입력창 토글
            setIsSubRowInputOpen(true);

            // 자동 focus
            setTimeout(() => {
              const subRowInput = document.querySelector(`[data-subrow-parrent='${row.rowId}'] input`) as HTMLInputElement | null;

              subRowInput?.focus();
            }, 10);
          }}
        >
          <span className='text-[#454545] w-full h-full'>
            <svg
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
              <path d="M12 5l0 14"></path>
              <path d="M5 12l14 0"></path>
            </svg>
          </span>
        </button>
      }
      {
        /* sub row 삭제 버튼 */
        field.type === 'name' && row.level !== 0 &&
        <button
          type="button"
          className={`
            group-hover:flex hidden items-center shrink-0
            basis-[22px] w-[22px] h-[22px] p-[1px] mx-[4px]
            border border-gray-300 rounded-[4px] cursor-pointer hover:bg-[#f3f3f3]
            text-[#454545] hover:text-[#db0000]
          `}
          onClick={async () => {
            try {
              await showModal({
                type: 'delete',
                title: `행을 삭제하시겠습니까?`
              });
              handleDeleteSubRow();
              showToast('삭제되었습니다.', 'success');
              return;
            } catch {
              console.log('사용자 취소');
              return;
            }
          }}
        >
          <span className='w-full h-full'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7l16 0" />
              <path d="M10 11l0 6" />
              <path d="M14 11l0 6" />
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
            </svg>
          </span>
        </button>
      }
    </div>
  )
}