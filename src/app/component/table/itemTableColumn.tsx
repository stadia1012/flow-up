'use client'
import { useState, useRef, useEffect } from 'react'
import type { Cell } from '@tanstack/react-table'

export default function ItemTableColumn<TData, TValue>({ children, cell }: { children: React.ReactNode, cell: Cell<TData, TValue> }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(() => cell.getValue())
  const inputRef = useRef<HTMLInputElement | null>(null);
  const divRef = useRef<HTMLInputElement | null>(null);

  // 자동 focus
  useEffect(() => {
    if (inputRef && divRef?.current) {
      const div = divRef.current;
      div.textContent = inputRef.current?.value || '';
    }
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing]);

  return (
    <div className={`
        border rounded-[4px]
        hover:text-blue-600 ${isEditing ? 'border-blue-400 hover:border-blue-400' : 'border-transparent hover:border-gray-300'}
        pt-[4px] pb-[4px] pl-[8px] pr-[8px] h-[32px] box-border
        cursor-pointer
        transition`
      }
      onClick={() => {
        if (!isEditing) {
          setIsEditing((prev) => !prev);
        }
      }}
    >
    {isEditing ? (
      // 수정모드
      <input
        type='text'
        className='w-full outline-none text-blue-600'
        value={String(editValue)}
        onChange={e => setEditValue(e.target.value as any)}
        onBlur={() => setIsEditing(false)}
        ref={inputRef}
        spellCheck='false'
        onKeyDown={(e) => {
          if (e.key === 'Enter') setIsEditing(false);
        }}
      />
    ) : (
      // 조회모드
      children
    )}
    </div>
  )
}