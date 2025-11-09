'use client'
import { useRef, useState } from "react";
import { useToast } from '@/app/context/ToastContext';
import { duplicateTaskRowsFromDB } from "@/app/controllers/taskController";
import Link from "next/link";
import { showModal } from "../../modalUtils";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/store/store";
import { setValues } from "@/app/store/tableSlice";
import { flash } from "@/app/animation";
import { SearchedResult } from "@/global";

export default function SearchedRow({
  rows, // order 구하는 용도
  itemId,
  result // 검색 결과
}: {
  rows: TaskRow[],
  itemId: number,
  result: SearchedResult
}) {
  const dispatch: AppDispatch = useDispatch();
  const { showToast } = useToast();
  const toggleSubRowButton = useRef<HTMLButtonElement>(null); // 토글 버튼
  const [isSubRowOpen, setIsSubRowOpen] = useState(false);

  /* row 복제 (start) */
  const handleDuplicateRows = async (sourceRowId: number) => {
    const newRows: TaskRow[] = rows.map(el => ({ 
      ...el,
      values: {...el.values},
      subRows: el.subRows ? el.subRows.map(sr => ({...sr, values: {...sr.values}})) : undefined
    }));

    // DB에 복제
    try {
      const res = await duplicateTaskRowsFromDB({
        itemId, // 현재 item (목적지)
        duplicateIds: [sourceRowId]
      });

      if (!res.success || !('rowsData' in res)) {
        throw new Error('복제 실패');
      }

      // DB에서 반환된 데이터로 state 업데이트
      const copiedRows = res.rowsData;
      
      copiedRows.forEach((rowData: any) => {
        const newParentRow: TaskRow = {
          values: rowData.values,
          rowId: rowData.rowId,
          parentId: null,
          level: 0,
          order: rowData.order,
          tagIds: rowData.tagIds,
        };

        // subrows 추가
        if (rowData.subRows && rowData.subRows.length > 0) {
          newParentRow.subRows = rowData.subRows.map((subData: any) => ({
            values: subData.values,
            rowId: subData.rowId,
            parentId: rowData.rowId,
            level: 1,
            order: subData.order,
            tagIds: subData.tagIds
          }));
        }

        newRows.push(newParentRow);
      });

      // state 업데이트
      dispatch(setValues({newRows: [...newRows]}));

      // flash 효과
      setTimeout(() => {
        copiedRows.forEach((rowData: any) => {
          const parentEl = document.querySelectorAll(`[data-row-id="${rowData.rowId}"] td`);
          if (parentEl) {
            parentEl.forEach(td => flash(td));
          }
          
          if (rowData.subRows) {
            rowData.subRows.forEach((subData: any) => {
              const subEl = document.querySelectorAll(`[data-row-id="${subData.rowId}"] td`);
              if (subEl) {
                subEl.forEach(td => flash(td));
              }
            });
          }
        });
      }, 10);

    } catch (error) {
      console.error('Row 복제 실패:', error);
      showToast('복제에 실패했습니다.', 'error');
    }
  };
  /* row 복제 (end) */
  return (
    <>
      <li
        key={result.rowId}
        className="group/li flex items-center py-[5px] hover:bg-gray-100 px-[10px] rounded-[4px] transition mr-[6px]"
      >
        {
          result.subRowNames.length > 0 && (
            // sub row가 있는 경우 버튼 표시
            <button
              type="button"
              className={`
                shrink-0 basis-[22px] w-[22px] h-[22px] p-[6.5px] mr-[3px]
                rounded-[4px] cursor-pointer hover:bg-[#f0f0f0]
              `}
              ref={toggleSubRowButton}
              onClick={() => {
                console.log(result.subRowNames)
                setIsSubRowOpen((prev) => !prev);
              }}
            >
              <span
                className={`
                  group-hover:flex items-center relative top-[1px] opacity-[0.6]
                  ${isSubRowOpen
                    ? 'flex rotate-0 text-[#555555]'
                    : 'flex text-[#888888] rotate-270'
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
          )
        }
        <span className="text-[14px]">{result.content}</span>
        <span className="relative ml-[8px] text-gray-500 text-[12px]">in [{result.itemName}] | {result.updateDate}</span>
        <div className="ml-auto opacity-0 group-hover/li:opacity-100 transition flex">
          {/* open 버튼 */}
          <button
            type="button"
            className="
              rounded-[5px] border border-gray-400 text-gray-700 text-[13px] bg-white
              px-[8px] py-[2px] mr-[5px]
              hover:bg-gray-100/70 hover:text-gray-800 transition cursor-pointer
            "
          >
            <Link href={{pathname: `/workspace/${result.itemId}`}} target="_blank">Open</Link>
          </button>
          {/* duplicate 버튼 */}
          <button
            type="button"
            className="
              rounded-[5px] border border-gray-400 text-gray-700 text-[13px] bg-white
              px-[8px] py-[2px] mr-[5px]
              hover:bg-gray-100/70 hover:text-gray-800 transition cursor-pointer
            "
            onClick={async () => {
              try {
                await showModal({
                  type: 'confirm',
                  title: `선택한 행을 현재 Item에 복제하시겠습니까?`,
                  buttonText: {confirm: '확인'}
                });
                handleDuplicateRows(result.rowId);
                showToast('복제되었습니다.', 'success');
                return;
              } catch {
                console.log('사용자 취소');
                return;
              }
            }}
          >Duplicate</button>
        </div>
      </li>
      {
        isSubRowOpen && (
          result.subRowNames.map((name, i)  => (
            <li
              key={i}
              className="group/li flex items-center py-[5px] hover:bg-gray-100 px-[10px] rounded-[4px] transition mr-[6px]"
            >
              <span className="text-[14px] pl-[25px]">{name}</span>
            </li>
          ))
        )
      }
    </>
  );
}