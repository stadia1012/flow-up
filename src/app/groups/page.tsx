'use client'
import { useRef, useState } from "react";
import GroupTableBody from "./groupTableBody";
import { createPortal } from "react-dom";
import AddGroupPopup from "./addGroupPopup";

export default function Main() {
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);

  // add group popup 
  const handleAddGoupPopup = () => {
    setIsAddPopupOpen(prev => !prev);
  }
  return (
    <div className='flex flex-col p-[15px] pt-[20px] overflow-auto w-full min-w-[400px]'>
      <div className='flex items-center h-[32px] pl-[15px]'>
        <h1 className='text-[15px] font-[600] '>User Groups</h1>
      </div>
      <div className='pl-[15px]'>
        <div className="flex py-[2px]">
          <button type="button"
            className="flex items-center justify-center py-[2px] pl-[5px] pr-[7px] mr-[2px]
            hover:bg-gray-200/70 cursor-pointer transition rounded-[4px]"
            onClick={handleAddGoupPopup}
          >
            <svg className="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="19" height="19" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor">
              <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"></path>
              <path d="M16.1 12h-8.5"></path>
              <path d="M12 7.8v8.7"></path>
            </svg>
            <span className="ml-[3px] text-[14px] relative top-[0.5px]">Add</span>
          </button>
          { // add group popup 
            isAddPopupOpen && createPortal(
              <AddGroupPopup handleAddGoupPopup={handleAddGoupPopup} />
            , document.body)
          }
          <button type="button" className="flex items-center justify-center py-[2px] pl-[5px] pr-[7px]
            hover:bg-gray-200/70 cursor-pointer transition rounded-[4px]">
            <svg className="" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M4 7l16 0" />
              <path d="M10 11l0 6" />
              <path d="M14 11l0 6" />
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
            </svg>
            <span className="ml-[3px] text-[14px] relative top-[0.5px]">Delete</span>
          </button>
        </div>
        <table className="w-max">
          <thead>
            <tr className="border-b border-transparent">
              <th className="w-[35px] h-[30px]">
                <div className="flex items-center justify-center border-b border-gray-300 h-full">
                  <input type="checkbox" />
                </div>
              </th>
              <th className="min-w-[190px] h-[30px]">
                <div className="flex items-center justify-center font-[500] text-[14px] border-b border-gray-300 h-full">Group Name</div>
              </th>
              <th className="min-w-[150px] h-[30px]">
                <div className="flex items-center justify-center font-[500] text-[14px] border-b border-gray-300 h-full">Department</div>
              </th>
              <th className="min-w-[150px] h-[30px]">
                <div className="flex items-center justify-center font-[500] text-[14px] border-b border-gray-300 h-full">Users</div>
              </th>
              <th className="min-w-[100px] h-[30px]">
                <div className="flex items-center justify-center font-[500] text-[14px] border-b border-gray-300 h-full">Status</div>
              </th>
            </tr>
          </thead>
          <GroupTableBody />
        </table>
      </div>
    </div>
  );
}