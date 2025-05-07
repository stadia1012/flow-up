'use client'
import { useState, useRef, useEffect } from 'react'
import type { Cell } from '@tanstack/react-table'

export default function ItemTableColumn<TData, TValue>({ children, cell }: { children: React.ReactNode, cell: Cell<TData, TValue> }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(() => cell.getValue())
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 자동 focus
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing]);

  const saveValue = () => {
  
  }

  return (
    <div className='
      border border-transparent rounded-[4px]
      hover:border-gray-300 hover:text-blue-600
      pt-[4px] pb-[4px] pl-[8px] pr-[8px]
      cursor-pointer
      transition
    '
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
      />
    ) : (
      // 조회모드
      children
    )}
    </div>
  )
}