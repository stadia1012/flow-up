'use client'
import { MouseEvent, useEffect, useRef, useState } from "react";
import { useToast } from '@/app/context/ToastContext';
import { duplicateTaskRowsFromDB, getRowFromDB, searchRowsFromDB } from "@/app/controllers/taskController";
import Link from "next/link";
import { showModal } from "../../modalUtils";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/store/store";
import { setRealId, setSubRowId, setValues } from "@/app/store/tableSlice";
import { flash } from "@/app/animation";

export default function SearchPopup({
  rows, // order 구하는 용도
  itemId,
  setIsSearchPopupOpen
}: {
  rows: TaskRow[],
  itemId: number,
  setIsSearchPopupOpen: (isOpen: boolean) => void
}) {
  const dispatch: AppDispatch = useDispatch();
  const { showToast } = useToast();

  // 자동 focus
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // 검색 결과
  type SearchedResult = {
    rowId: number,
    itemId: number,
    content: string,
    itemName: string
  };
  const [searchedResults, setSearchedResults] = useState<SearchedResult[]>([]);

  // popup 외부 클릭 시 팝업 종료
  const handleClickOutside = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsSearchPopupOpen(false);
  };

  // enter 감지
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  // 검색 처리
  const handleSearch = () => {
    const keyword = searchInputRef.current?.value.trim();
    if (keyword) {
      searchRowsFromDB(keyword).then((res) => {
        setSearchedResults(res);
      });
    } else {
      showToast('검색어를 입력해주세요.', 'error');
      searchInputRef.current!.focus();
    }
  }

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

  const searchInputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      className="flex justify-center fixed z-100 h-full w-full top-0 left-0"
      onClick={(e) => handleClickOutside(e)}
    >
      <div
        className="absolute bg-white rounded-[6px] shadow-[var(--popupShadow)] cursor-default z-100 popup-menu w-[830px] h-[540px] top-[100px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 검색어 입력 영역 */}
        <div className="flex py-[10px] px-[15px] border-b border-gray-300">
          <input
            ref={searchInputRef}
            type="text"
            className="
              outline-none text-[14px] text-left
              w-full border border-gray-300 focus:border-blue-400
              rounded-[8px] px-[10px] py-[4px] transition
            "
            placeholder="Search name or content..."
            autoComplete="off"
            spellCheck="false"
            maxLength={50}
            onKeyDown={handleKeyDown}
          ></input>
          <button
            type="button"
            className="
              ml-[10px] flex items-center
              bg-white border border-blue-400 hover:bg-blue-100 text-blue-500
              pl-[7px] pr-[7px] rounded-[4px] transition
            "
            onClick={handleSearch}
          >
            <svg
              className='relative mr-[0px] top-[0px] w-[15px] h-[15px]' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            >
              <path d="M18 6v6a3 3 0 0 1 -3 3h-10l4 -4m0 8l-4 -4"></path>
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto h-[470px] scroll-8px ml-[15px] mr-[8px] my-[5px]">
          {/* 검색 결과 영역 */}
          {searchedResults.length === 0 ? (
            <p className="text-gray-500 text-center mt-[50px]">No results found.</p>
          ) : (
            <ul>
              {searchedResults.map((result) => (
                <li
                  key={result.rowId}
                  className="group/li flex items-center py-[5px] hover:bg-gray-100 px-[10px] rounded-[4px] transition mr-[6px]"
                >
                  <span className="text-[14px]">{result.content}</span>
                  <span className="relative ml-[8px] text-gray-500 text-[12px]">in {result.itemName}</span>
                  <div className="ml-auto opacity-0 group-hover/li:opacity-100 transition flex">
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
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}