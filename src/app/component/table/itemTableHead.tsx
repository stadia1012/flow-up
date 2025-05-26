'use client'
import { updateFieldWidth } from "@/app/controllers/taskController";
import { useState, useEffect, useRef, MouseEvent } from "react";
export default function ItemTableHead({field}: {
  field: TaskField
}) {
  const [width, setWidth] = useState(field.width);
  const isResizing = useRef(false);
  const thRef = useRef<HTMLTableCellElement>(null);

  // 마우스로 width 조절
  useEffect(() => {
    function handleMouseMove(e: MouseEvent<Document>) {
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

// 리사이저에서 마우스 누를 때
  const onMouseDown = (e: MouseEvent<HTMLTableCellElement>) => {
    isResizing.current = true;
    document.body.style.cursor = "ew-resize";
    e.preventDefault();
  };
  return (
    <th
      ref={thRef}
      className={`
        relative
        cursor-pointer hover:bg-gray-100
        transition
      `}
      data-field-id={field.fieldId}
      data-type={field.type}
      style={{
        width: `${width}px`
      }}
    >
      <div className='flex items-center border-b border-gray-300 pl-[8px] pt-[3px] pb-[3px] text-left text-gray-500 font-[500] text-[13px] h-[32px]'>
        <p>{field.name}</p>
      </div>
      {/* 리사이즈 핸들러 */}
      <div
        onMouseDown={onMouseDown}
        className='absolute right-0 top-0 h-full w-[8px] cursor-col-resize select-none border-r-[4px] border-transparent hover:border-blue-300 transition-all'
      />
    </th>
  )
}