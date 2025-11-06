import { flash } from "@/app/animation";
import { useToast } from "@/app/context/ToastContext";
import { useRef } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/app/store/store";
import { setSubRow, setSubRowId } from "@/app/store/tableSlice";
import { addTaskSubRowToDB } from "@/app/controllers/taskController";

export default function SubRowInput({
  itemId,
  row,
  fields,
  setIsSubRowOpen,
  setIsSubRowInputOpen,
  toggleSubRowButton,
  addSubRowButton,
}: {
  itemId: number,
  row: TaskRow, // parent row
  fields: TaskField[],
  setIsSubRowOpen: (arg: boolean) => void,
  setIsSubRowInputOpen: (arg: boolean) => void,
  toggleSubRowButton: React.RefObject<HTMLButtonElement | null>,
  addSubRowButton: React.RefObject<HTMLButtonElement | null>;
}) {
  const {showToast} = useToast();
  const dispatch: AppDispatch = useDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  // 키 입력
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
    if (e.key === "Escape") {
      (e.target as HTMLInputElement).blur();
    }
  }

  // 저장 전 검증
  const handleAddTask = async () => {
    const newName = inputRef.current?.value.trim();
    if (!newName) {
      showToast('이름을 입력해주세요.', 'error');
      return;
    }
    setIsSubRowInputOpen(false);
    addTaskRow(newName);
  }

  // 저장 처리
  const addTaskRow = (name: string) => {
    const newSubRows = structuredClone(row.subRows || []);
    const maxOrder = newSubRows.reduce(
      (max, el) => (el.order > max ? el.order : max), 0
    );

    // 임시 rowId 생성
    const tempRowId = Date.now();
    const newRow: TaskRow = {
      values: {},
      rowId: tempRowId,
      parentId: row.rowId,
      level: row.level + 1,
      order: maxOrder + 1,
      tagIds: []
    };

    // value 초기화
    const nameField = fields.find(f => f.type === 'name');
    fields.forEach(f => {
      newRow.values[f.fieldId] = (f.fieldId === nameField?.fieldId) ? name : '';
    });

    // 상태 업데이트
    newSubRows.push(newRow);
    dispatch(setSubRow({
      parentRowId: row.rowId,
      newSubRows: [...newSubRows]
    }));

    // flash
    setTimeout(() => {
      const el = document.querySelectorAll(`[data-row-id="${tempRowId}"] td`);
      if (el) {
        el.forEach(td => flash(td));
      }
    }, 10);

    // DB에 추가
    addTaskSubRowToDB({
      itemId,
      parentRowId: row.rowId,
      parentLevel: row.level,
      fieldId: nameField?.fieldId || 0,
      name
    }).then((res) => {
      // temp id를 real id로 변경
      dispatch(
        setSubRowId({
          parentRowId: row.rowId,
          tempId: tempRowId,
          realId: res.ID
        })
      );
    });
  }

  return (
    <tr className="border-b border-gray-200/95" data-subrow-parrent={row.rowId}>
      <td></td>
      <td></td>
      <td>
        <div className="flex items-center relative py-[2px]"
          style={{
            paddingLeft: 25 + ((row.level + 1) * 25) + 'px'
          }}
        >
          <input
            type="text"
            className="border border-blue-400 rounded-[4px] text-blue-600
            pt-[3px] pb-[3px] pl-[8px] pr-[8px] outline-none w-full"
            ref={inputRef}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
              if (inputRef && inputRef.current?.value.trim()) {
                // 값이 있으면 저장처리
                handleAddTask();
                return;
              }
              // 값이 없으면 취소처리
              
              if (e.relatedTarget === toggleSubRowButton.current) {
                // toggle sub row button으로 인한 blur인 경우 return 처리
                return;
              }
              if (e.relatedTarget === addSubRowButton.current) {
                return;
              }
              setIsSubRowInputOpen(false);
              if (row.subRows && row.subRows.length === 0) {
                // sub row가 없으면 입력창 닫기
                setIsSubRowInputOpen(false);
                setIsSubRowOpen(false);
              }
            }}
            autoComplete="off" spellCheck="false" maxLength={200}
          />
          {/* save button */}
          <div className="absolute inline-flex items-center right-[-130px] pt-[1px]">
            <button
              className="
                flex items-center top-[7px]
                bg-blue-500 hover:bg-blue-500/90 text-white text-[12px] font-[400]
                mr-[5px] p-[2px] pl-[8px] pr-[10px] rounded-[4px] transition
              "
              onMouseDown={e => e.preventDefault()}
              onClick={handleAddTask} type='button'
            >
              <svg className='relative mr-[3px] top-[0px]' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" strokeWidth="2">
                <path d="M18 6v6a3 3 0 0 1 -3 3h-10l4 -4m0 8l-4 -4"></path>
              </svg>
              <span>Save</span>
            </button>
            {/* cnacel button */}
            <button className="
                flex items-center top-[7px]
                bg-white border border-gray-300/90 hover:bg-gray-100 text-gray-500 text-[12px] font-[400]
                pt-[2px] pb-[1px] pl-[8px] pr-[8px] rounded-[4px] transition
              "
              onMouseDown={e => e.preventDefault()}
              onClick={() => setIsSubRowInputOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </td>
    </tr>
  )
}