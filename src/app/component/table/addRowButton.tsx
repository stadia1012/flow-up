'use client'
import { useState, useRef, useEffect } from "react";
import { showModal } from '@/app/component/modalUtils';
export default function AddRowButton({fields, addTaskRow} : {fields : TaskField[], addTaskRow: (name: string) => void}) {
  const [isInAddMode, setIsInAddMode] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // add 모드 전환
  const handleAddMode = () => {
    setIsInAddMode((prev) => !prev)
  }

  // focus() 처리
  useEffect(() => {
    if (isInAddMode) {
      inputRef.current?.focus();
    } else {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }, [isInAddMode])

  // 키 입력
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
    if (e.key === "Escape") {
      handleAddMode();
    }
  }

  const handleAddTask = async () => {
    const newName = inputRef.current?.value.trim();

    if (!newName?.trim()) {
      const title = '이름을 입력해주세요.';
      try {
        await showModal({
          type: 'alert',
          title: title
        });
        return;
      } catch {
        return;
      }
    }
    handleAddMode();
    addTaskRow(newName);
  }
  return (
    <>
      {
      !isInAddMode ? 
      <tr className='relative'>
        <td>{/* default field (drag button) */}</td>
        <td>{/* default field (checkbox) */}</td>
        <td className="sticky left-[30px] bg-white z-1">
          {<button className='
              flex items-center
              border border-gray-300 rounded-[3px]
              hover:border-gray-400
              pt-[1px] pb-[1px] pr-[6px] pl-[3px]
              mt-[6px]
              cursor-pointer transition group
            '
            onClick={handleAddMode}
          >
            <span>
              <svg className='text-[#777777] group-hover:text-[#555555]' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="17" height="17" strokeWidth="1.5">
                <path d="M12 5l0 14"></path>
                <path d="M5 12l14 0"></path>
              </svg>
            </span>
            <span className='text-[13px] text-gray-500 font-[400] ml-[3px] group-hover:text-gray-700 truncate'>Add Task</span>
          </button>}
        </td>
      </tr> :
      <tr>
        <td></td>
        <td></td>
        <td className="relative pt-[5px]">
          <input
            type="text"
            className="border border-blue-400 rounded-[4px] text-blue-600
            pt-[2px] pb-[2px] pl-[8px] pr-[8px] outline-none w-full"
            ref={inputRef}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputRef && inputRef.current?.value.trim()) {
                // 값이 있으면 저장처리
                handleAddTask();
            
              } else {
                // 값이 없으면 취소처리
                handleAddMode();
              }
            }}
          />
          {/* save button */}
          <button
            className="
              absolute flex items-center top-[7px] right-[-68px]
              bg-blue-500 hover:bg-blue-500/90 text-white text-[12px] font-[400]
              p-[2px] pl-[8px] pr-[10px] rounded-[4px] transition
            "
            onMouseDown={e => e.preventDefault()}
            onClick={handleAddTask} type='button'
          >
            <svg className='relative mr-[3px] top-[1px]' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" strokeWidth="2">
              <path d="M18 6v6a3 3 0 0 1 -3 3h-10l4 -4m0 8l-4 -4"></path>
            </svg>
            <span>Save</span>
          </button>
          {/* cnacel button */}
          <button className="
              absolute flex items-center top-[7px] right-[-126px]
              bg-white border border-gray-300/90 hover:bg-gray-100 text-gray-500 text-[12px] font-[400]
              pt-[2px] pb-[1px] pl-[8px] pr-[8px] rounded-[4px] transition
            "
            onMouseDown={e => e.preventDefault()}
            onClick={handleAddMode}
          >
            Cancel
          </button>
        </td>
      </tr>
      }
    </>
  );
}