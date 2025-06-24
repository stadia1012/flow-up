'use client'
import { useRef, useState } from "react";
import OrgTree from "../orgTree";

export default function EditPermissionPopup(
  {setIsPopupOpen, field, newName}:
  {
    setIsPopupOpen: (arg: boolean) => void,
    field?: TaskField // edit 시에 사용
    newName?: string // add 시에 사용
  }) {
  // 선택된 user or department
  const [selectedNode, setSelectedNode] = useState<{type: string, id: string}[]>([])
  
  // 검색 input ref
  const searchKeywordRef = useRef<HTMLInputElement>(null);
  return (
    <div className="absolute h-full w-full top-[0px] left-[0px] z-3"
      onClick={(e) => {
        e.stopPropagation(); // fieldSlide 닫힘 방지
      }}> 
      <div className="h-full w-full bg-gray-300 opacity-[50%] top-[0x] left-[0px]">
        {/* 반투명 배경 */}
      </div>
      <div className="absolute top-[30%] left-[50%] translate-x-[-50%] translate-y-[-30%] text-[14px]">
        <div
          className='bg-white px-[25px] pt-[20px] pb-[10px] rounded-[6px] shadow-[var(--popupShadow)] cursor-default z-3'
        >
          <button
            type="button" className="absolute right-[7px] top-[8px] hover:bg-[#ecedf1] rounded-[4px] p-[2px] cursor-pointer" onClick={() => setIsPopupOpen(false)}>
            <svg
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#555" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" strokeWidth="2">
              <path d="M18 6l-12 12"></path>
              <path d="M6 6l12 12"></path>
            </svg>
          </button>
          <div className="flex items-center mb-[5px]">
            <div>
              <h2 className="font-[500] text-[15px]">Edit Permission</h2>
            </div>
          </div>
          <div className="flex flex-col">
            {/* 그룹명 */}
            <div className="flex items-center border border-gray-300 mb-[7px] rounded-[5px]" style={{boxShadow: '1px 1px 2px rgb(0 0 0 / 10%)'}}>
              <div className="py-[3px] px-[12px] border-r border-gray-300  text-[13px] font-[500] rounded-l-[5px] bg-[#ecf6ff]">Field Name</div>
              <div className="p-[3px] ml-[3px] font-[500]">
                {field?.name || newName || ''}
              </div>
            </div>
            <div className="flex">
              {/* 검색 */}
              <div className="border border-gray-300 w-[260px] rounded-[5px]" style={{boxShadow: '1px 1px 2px rgb(0 0 0 / 10%)'}}>
                <div className="border-b border-gray-300 py-[4px] px-[10px] text-[13px] font-[500] rounded-t-[5px] bg-[#ecf6ff]">
                  <h3>Search</h3>
                </div>
                <div className="border-b border-gray-300">
                  <div className="flex px-[5px] py-[6px]">
                    <input type="text" ref={searchKeywordRef}
                      className="outline-none border border-gray-400/89 w-full py-[1px] px-[4px] rounded-[2px]
                      transition focus:border-blue-400 hover:border-blue-300"
                    />
                    <button
                      type="button"
                      className="ml-[3px] hover:bg-gray-200/80 px-[4.5px] cursor-pointer rounded-[3px] transition border border-gray-300 bg-gray-100/90"
                      // onClick={searchUserOrDepartmentByName}
                    >
                      <svg
                        className="h-[14px] w-[14px] top-[0.5px] relative"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#000000"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                        <path d="M21 21l-6 -6" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-[3px] mb-[4px] ml-[3px]">
                  {/* Add button */}
                  <button type="button" className="flex items-center justify-center pl-[8px] pr-[12px] py-[2px] text-[12px] rounded-[5px] cursor-pointer bg-blue-500/90 text-white font-[300] hover:bg-blue-500 transition">
                    <div className="w-[14px] h-[14px] mr-[1px]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"                      
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 5l0 14" />
                        <path d="M5 12l14 0" />
                      </svg>
                    </div>
                    <span className="relative top-[0.7px]">Add</span>
                  </button>
                </div>
                <div className="h-[420px] overflow-auto scroll-8px">
                  <OrgTree></OrgTree>
                  <ul>

                  </ul>
                </div>
              </div>
              {/* arrow */}
              <div className="flex justify-center items-center w-[20px]">
                <svg
                  className="text-blue-500/80 h-[24px] w-[24px]"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="6 0 12 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 6l6 6l-6 6" />
                </svg>
              </div>
              {/* 선택 영역 */}
              <div className="border border-gray-300 w-[300px] rounded-[5px]" style={{boxShadow: '1px 1px 2px rgb(0 0 0 / 10%)'}}>
                <div className="border-b border-gray-300 py-[4px] px-[10px] text-[13px] font-[500] rounded-t-[5px] bg-[#ecf6ff]">
                  <h3>Added Users / Departments</h3>
                </div>
                <div>
                  <table>

                  </table>
                </div>
              </div>
            </div>
            {/* 검색 영역 */}
          </div>
          <div className="flex mt-[8px]">
            <button type="button"
              className="ml-auto bg-blue-500 hover:bg-blue-500/90 text-[13px] text-white px-[12px] py-[2px] rounded-[3px] cursor-pointer"
              onClick={() => {
                setIsPopupOpen(false);
            }}>확인</button>
          </div>
        </div>
      </div>
    </div>
  )
}