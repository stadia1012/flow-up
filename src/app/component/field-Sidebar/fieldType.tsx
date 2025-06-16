'use client'
import { TaskFieldType } from "@/global";
import { useState } from "react";

export default function FieldType({fieldType, handleCheckbox, isChecked}:
  {
    fieldType: TaskFieldType,
    handleCheckbox: React.MouseEventHandler<HTMLButtonElement>,
    isChecked: boolean
  }) {
  const typeIcons: Record<string, React.ReactElement> = {
    text : (
      <div className="flex items-center justify-center h-[22px] w-[22px] bg-blue-200/70 rounded-[3px] mr-[7px]">
        <svg className="text-blue-500" style={{}} xmlns="http://www.w3.org/2000/svg" width="14px" height="14px" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 3V21M9 21H15M19 6V3H5V6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>),
    number : (
      <div className="flex items-center justify-center h-[22px] w-[22px] bg-green-200/65 rounded-[3px] mr-[7px]">
        <svg className="text-green-600" width="14px" height="14px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.705 8.0675H21.295M2.705 15.9325H21.295M18.0775 2.705L14.5025 21.295M10.2125 2.705L6.6375 21.295" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>),
    dropdown : (
      <div className="flex items-center justify-center h-[22px] w-[22px] bg-orange-200/70 rounded-[3px] mr-[7px]">
        <svg className="text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="15px" height="15px" strokeWidth="2">
          <path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"></path>
          <path d="M9 11l3 3l3 -3"></path>
        </svg>
      </div>),
  }
  return (
    <li data-id={fieldType.fieldTypeId}
      className="flex items-center relative cursor-pointer
        rounded-[5px] hover:border-gray-400 hover:bg-gray-200/70 py-[6px] px-[15px] transition"
      onClick={(e) => {e.stopPropagation();}}
    >
      {/* icon */}
      {typeIcons[fieldType.type]}
      {/* name */}
      <p className="ml-[5px]">{fieldType.name}</p>
      {/* checkbox */}
      <button type="button"
        className={`
          flex items-center relative
          ml-auto rounded-[10px] w-[32px] h-[18px]
          p-[3px] cursor-pointer transition
          ${isChecked ? 'bg-blue-500 hover:bg-blue-600/90': 'bg-gray-400/80 hover:bg-gray-400'}
          `}
        onClick={(e) => {
          e.stopPropagation();
          handleCheckbox(e);
        }}
      >
          <div className={`relative transition rounded-full bg-white w-[12px] h-full ${isChecked ? 'mr-auto': 'ml-auto'}`}></div>
      </button>
    </li>
  )
}