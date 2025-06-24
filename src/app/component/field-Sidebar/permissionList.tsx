'use client'

import { useState } from "react";
import EditPermissionPopup from "./editPermissionPopup";
import { createPortal } from "react-dom";
export default function PermissionList({isPermissionEnabled, field, newName}:
  {
    isPermissionEnabled: boolean,
    field?: TaskField // edit 시에 사용
    newName?: string // add 시에 사용
  }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  return (
    <>
      <div
        className={`border border-gray-300 rounded-[3px] p-[2px] mt-[5px] transition
        ${!isPermissionEnabled ? 'cursor-not-allowed opacity-[55%]' : ''}`}
      >
        <button type="button" className={`
          flex items-center rounded-[5px]
          bg-gray-100/60 border border-gray-300 transition
          pl-[5px] w-full py-[2px] ${!isPermissionEnabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-200/80'}`}
          onClick={() => setIsPopupOpen(true)}
        >
          <div>
            <svg className="mr-[5px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="20" height="20" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor">
              <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"></path><path d="M16.1 12h-8.5"></path><path d="M12 7.8v8.7"></path>
            </svg>
          </div>
          <span className="text-[13px] relative top-[0.5px] ml-[2px]">Edit Permission</span>
        </button>
        <div className="p-[2px] text-[12px]">
          <div className="text-center text-gray-500 font-[300] mt-[2px]">No Users & Departments Added</div>
        </div>
      </div>
      {/* Edit Permission Popup */
      isPopupOpen && createPortal(
        field ?
        <EditPermissionPopup setIsPopupOpen={setIsPopupOpen} field={field} />:
        <EditPermissionPopup setIsPopupOpen={setIsPopupOpen} newName={newName} />
        , document.body)
      }
    </>
  )
}