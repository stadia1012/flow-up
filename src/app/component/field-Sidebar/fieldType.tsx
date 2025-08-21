'use client'
import { TaskFieldType } from "@/global";
import { deleteFieldTypeFromDB } from '@/app/controllers/taskController';
import { showModal } from "../modalUtils";
import { useToast } from "@/app/context/ToastContext";
import { useState } from "react";
export default function FieldType({fieldType, handleCheckbox, isChecked}:
  {
    fieldType: TaskFieldType,
    handleCheckbox: React.MouseEventHandler<HTMLButtonElement>,
    isChecked: boolean
  }) {
  const [isDelete, setIsDelete] = useState(false);
  const {showToast} = useToast();
  // 타입별 icon
  const typeIcons: Record<string, React.ReactElement> = {
    text : (
      <div className="shrink-0 flex items-center justify-center h-[22px] w-[22px] bg-blue-200/70 rounded-[3px] mr-[7px]">
        <svg className="text-blue-500" style={{}} xmlns="http://www.w3.org/2000/svg" width="14px" height="14px" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 3V21M9 21H15M19 6V3H5V6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>),
    number : (
      <div className="shrink-0 flex items-center justify-center h-[22px] w-[22px] bg-green-200/65 rounded-[3px] mr-[7px]">
        <svg className="text-green-600" width="14px" height="14px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.705 8.0675H21.295M2.705 15.9325H21.295M18.0775 2.705L14.5025 21.295M10.2125 2.705L6.6375 21.295" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>),
    dropdown : (
      <div className="shrink-0 flex items-center justify-center h-[22px] w-[22px] bg-orange-200/70 rounded-[3px] mr-[7px]">
        <svg className="text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="15px" height="15px" strokeWidth="2">
          <path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"></path>
          <path d="M9 11l3 3l3 -3"></path>
        </svg>
      </div>),
  }

  // 타입 삭제
  const deleteFieldType = async ({id, name}: {id: number, name: string}) => {
    try {
      await showModal({
        type: 'delete',
        title: `'${name}' 필드 타입을 삭제하시겠습니까? \n해당 필드 타입을 사용하는 필드가 모든 항목에서 삭제됩니다.`,
      });
      // continue
      deleteFieldTypeFromDB({fieldTypeId: id});
      setIsDelete(true);
      showToast('삭제되었습니다.', 'success');
    } catch {
      console.log('사용자 취소');
      return;
    }
  }
  return (
    <li data-id={fieldType.fieldTypeId}
      className={`${!isDelete ? 'flex' : 'hidden'}
        group items-center relative cursor-default
        rounded-[5px] hover:border-gray-400 hover:bg-gray-200/70 py-[6px] px-[15px] transition`}
      onClick={(e) => {e.stopPropagation();}}
    >
      {/* icon */}
      {typeIcons[fieldType.type]}
      {/* name */}
      <p className="ml-[5px] truncate">{fieldType.name}</p>
      <div className="flex shrink-0 items-center relative ml-auto">
        {/* delete button (hidden만) */}
        {!isChecked &&
        <button type="button" className="
            group-hover:flex hidden items-center relative mr-[5px]
            rounded-[5px] w-[18px] h-[18px] cursor-pointer hover:bg-gray-300"
          onClick={() => deleteFieldType({
            id: fieldType.fieldTypeId,
            name: fieldType.name
          })}
        >
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M4 7l16 0"></path>
            <path d="M10 11l0 6"></path>
            <path d="M14 11l0 6"></path>
            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
          </svg>
        </button>
        }
        {/* checkbox */}
        <button type="button"
        className={`
          flex shrink-0 items-center relative
          rounded-[10px] w-[32px] h-[18px]
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
      </div>
      
    </li>
  )
}