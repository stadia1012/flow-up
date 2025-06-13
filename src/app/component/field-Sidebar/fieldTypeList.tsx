'use client'
import { getFieldTypes } from "@/app/controllers/taskController";
import { TaskFieldType } from "@/global";
import { useEffect, useState } from "react";

export default function FieldTypeList() {
  const [fields, setFields] = useState<TaskFieldType[]>([]);
  const typeIcons = {
    'text' : `
      <svg className="text-blue-500" style={{}} xmlns="http://www.w3.org/2000/svg" width="14px" height="14px" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 3V21M9 21H15M19 6V3H5V6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>`,
    'number' : `
      <svg className="text-green-600" width="14px" height="14px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.705 8.0675H21.295M2.705 15.9325H21.295M18.0775 2.705L14.5025 21.295M10.2125 2.705L6.6375 21.295" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>`,
    'dropdown' : `
      <svg className="text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="15px" height="15px" strokeWidth="2">
      <path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"></path>
      <path d="M9 11l3 3l3 -3"></path>
    </svg>`,
  }
  useEffect(() => {
    getFieldTypes()
      .then((res) => {
        setFields(res);
        console.log(res);
      })
      .catch((err) => {
        console.error("Failed to load field types:", err);
      });
  }, []);
  return (
    <>
      {fields
        .filter((f) => f.fieldTypeId !== 1) // name은 제거
        .map((field, i) => (
          <li key={i}
            className="flex items-center relative cursor-pointer
              rounded-[5px] hover:border-gray-400 hover:bg-gray-200/70 py-[6px] px-[15px] transition"
            onClick={(e) => {e.stopPropagation();}}
          >
            {/* icon */}
            <div className="flex items-center justify-center h-[22px] w-[22px] bg-orange-200/70 rounded-[3px] mr-[7px]">
              {typeIcons[field.type]}
            </div>
            {/* name */}
            <p className="ml-[5px]">{field.name}</p>
          </li>
        )
      )}
    </>
  )
}