'use client'
import { showModal } from "../modalUtils";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/app/store/store";
import { deleteItemFieldFromDB } from "@/app/controllers/taskController";
import { setFields } from "@/app/store/tableSlice";
export default function FieldSettingsPopup(
  {popupRef, popupPos, field, fields, setIsPopupOpen, setIsMountSidebar, setCloseSidebar}:
  {
    popupRef: React.RefObject<HTMLDivElement | null>,
    popupPos: {top: number, left: number} | null,
    field: TaskField,
    fields: TaskField[],
    setIsPopupOpen: (arg: boolean) => void,
    setIsMountSidebar: (arg: boolean) => void,
    setCloseSidebar: (arg: boolean) => void
  }) {
    const dispatch: AppDispatch = useDispatch();
    const handleDeleteField = async () => {
      const title = `'${field.name}' 필드를 삭제하시겠습니까? \n복구할 수 없습니다.`;
      try {
        await showModal({
          type: 'delete',
          title: title
        });
  
        // 삭제 처리 (DB)
        await deleteItemFieldFromDB({
          fieldId: field.fieldId
        });

        const newFields = fields.filter((f) => f.fieldId !== field.fieldId);

        // 삭제 처리 (store)
        dispatch(setFields({
          newFields: newFields
        }))
      } catch {
        console.log('사용자 취소');
      }
    };

  return (
    <div ref={popupRef} className="absolute" style={{ top: popupPos?.top, left: popupPos?.left }}>
      <div
      className='bg-white p-[10px] pl-[7px] pr-[7px] rounded-[6px] shadow-[var(--popupShadow)] cursor-default z-3'
      >
        {/* 필드 수정 */}
        <div
          className="flex items-center hover:bg-gray-200/65 rounded-[4px] p-[8px] pt-[3px] pb-[3px] cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setIsMountSidebar(true);
            setCloseSidebar(false); // 초기화
            setIsPopupOpen(false);
          }}
        >
          {/* 설정 아이콘 */}
          <div className="relative top-[-1px] w-[19px] h-[19px] mr-[8px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
              <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
            </svg>
          </div>
          {/* 설정 이름 */}
          <div
            className="w-[100px] text-[14px]"
          >필드 수정</div>
        </div>
        {/* 삭제 */}
        <div
          className="flex items-center hover:bg-gray-200/65 rounded-[4px] p-[8px] pt-[3px] pb-[3px] cursor-pointer"
          onClick={() => {
            setIsPopupOpen(false);
            handleDeleteField();
          }}
        >
          {/* 설정 아이콘 */}
          <div className="relative top-[-1px] w-[19px] h-[19px] mr-[8px]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
              <path d="M4 7l16 0"></path>
              <path d="M10 11l0 6"></path>
              <path d="M14 11l0 6"></path>
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
            </svg>
          </div>
          {/* 설정 이름 */}
          <div
            className="w-[100px] text-[14px]"
          >삭제</div>
        </div>
      </div>
    </div>
  )
}