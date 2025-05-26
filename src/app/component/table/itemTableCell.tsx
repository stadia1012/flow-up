'use client'
import { useState, useRef, useEffect } from 'react'

export default function ItemTableColumn<TData extends { rowId: number }, TValue>({
  children,
  updateValue,
  rowId,
  fieldId
}: { 
  children: React.ReactNode,
  rowId: number,
  fieldId: number,
  updateValue: ({rowId, fieldId, value} : {rowId: number, fieldId: number, value: string}) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(children || '')
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 자동 focus
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleUpdateValue = () => {
    const value = inputRef.current?.value || '';
    if (editValue !== children) {
      updateValue({
        rowId: rowId,
        fieldId: fieldId,
        value: value
      });
    }
    setIsEditing(false);
  }

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
        onBlur={() => handleUpdateValue()}
        ref={inputRef}
        spellCheck='false'
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleUpdateValue();
          if (e.key === 'Escape') setIsEditing(false);
        }}
        maxLength={200}
      />
    ) : (
      // 조회모드
      children
    )}
    </div>
  )
}