'use client'
import { useState, useRef, useEffect } from 'react'
import DropdownContent from './dropdownContent';
import TextContent from './textContent';
import NameContent from './nameContent';

export default function ItemTableCell({
  updateValue,
  rowId,
  field,
  value
}: { 
  rowId: number,
  field: TaskField,
  updateValue: ({rowId, fieldId, value} : {rowId: number, fieldId: number, value: string}) => void,
  value: string
}) {
  const [isEditing, setIsEditing] = useState(false); // 수정모드
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleUpdateValue = ({newValue}: {newValue: string}) => {
    if (newValue !== value) {
      updateValue({
        rowId: rowId,
        fieldId: field.fieldId,
        value: newValue
      });
    }
    setIsEditing(false);
  }
  return (
    <div
      ref={containerRef}
      className={`
        border rounded-[4px]
        hover:text-blue-600 ${isEditing ? 'border-blue-400 hover:border-blue-400' : 'border-transparent hover:border-gray-300'}
        ${field.type === "dropdown" ? '' : 'pt-[4px] pb-[4px] px-[8px] '}
        h-[32px] box-border
        cursor-pointer
        transition
      `}
      onClick={() => {
        if (!isEditing) {
          setIsEditing((prev) => !prev);
        }
      }}
    > 
      { // name 인 경우
        (field.type === "name") && 
        <NameContent
          field={field}
          value={value}
          handleUpdateValue={handleUpdateValue}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
      }
      { // text, name 인 경우
        (field.type === "text") && 
        <TextContent
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
  )
}