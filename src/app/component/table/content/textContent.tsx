'use client'
import { useState, useEffect, useRef } from 'react'

export default function TextContent({
  isEditing,
  field,
  value,
  handleUpdateValue,
  setIsEditing
}: { 
  isEditing: boolean,
  field: TaskField,
  value: string,
  handleUpdateValue: ({newValue}: {newValue: string}) => void,
  setIsEditing: (isEditing: boolean) => void
}) {
  const [cellValue, setCellValue] = useState(value ?? '');

  const inputRef = useRef<HTMLInputElement | null>(null);
  // 자동 focus
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div className={`${(field.type === 'name') && 'font-[500]'}`}>
      { isEditing ? (
        // 수정모드
        <input
          type='text'
          className='w-full outline-none text-blue-600'
          value={cellValue}
          onChange={(e) => {setCellValue(e.target.value)}}
          onBlur={(e) => handleUpdateValue({newValue: cellValue})}
          ref={inputRef}
          autoComplete='off'
          spellCheck='false'
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleUpdateValue({newValue: (e.target as HTMLInputElement).value});
            if (e.key === 'Escape') setIsEditing(false);
          }}
          maxLength={200}
        />
      ) : (
        // 조회모드
        <div className={`truncate w-auto`}>
          {cellValue}
        </div>
      )}
    </div>
  )
}