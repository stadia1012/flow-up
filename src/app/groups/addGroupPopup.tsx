'use client'
export default function AddGroupPopup(
  {handleAddGoupPopup}:
  {handleAddGoupPopup: () => void}) {
  return (
    <div className="absolute h-full w-full top-[0px] left-[0px]">
      <div className="h-full w-full bg-gray-300 opacity-[50%] top-[0x] left-[0px]">
        {/* 반투명 배경 */}
      </div>
      <div className="absolute top-[30%] left-[50%] translate-x-[-50%] translate-y-[-30%] text-[14px]">
        <div
          className='bg-white px-[25px] pt-[20px] pb-[10px] rounded-[6px] shadow-[var(--popupShadow)] cursor-default z-3'
        >
          <button
            type="button" className="absolute right-[7px] top-[8px] hover:bg-[#ecedf1] rounded-[4px] p-[2px] cursor-pointer" onClick={handleAddGoupPopup}>
            <svg
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#555" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" strokeWidth="2">
              <path d="M18 6l-12 12"></path>
              <path d="M6 6l12 12"></path>
            </svg>
          </button>
          <div className="flex items-center mb-[5px]">
            <div>
              <h2 className="font-[500] text-[15px]">Add Group</h2>
            </div>
          </div>
          <div className="flex flex-col">
            {/* 그룹명 */}
            <div className="flex items-center border border-gray-400 mb-[5px]">
              <div className="py-[3px] px-[12px] bg-blue-100/80 border-r border-gray-400 text-[14px] h-[30px]">Group Name</div>
              <div className="p-[3px]">
                <input type="text" className="outline-none border border-gray-400/90 w-full py-[1px] px-[4px] rounded-[2px] transition focus:border-blue-400 hover:border-blue-300" />
              </div>
            </div>
            <div className="flex">
              {/* 검색 */}
              <div className="border border-gray-400 w-[230px]">
                <div className="border-b border-gray-400 bg-blue-100/80 py-[3px] px-[6px] text-[14px]">
                  <h3>검색</h3>
                </div>
                <div className="border-b border-gray-400">
                  <div className="flex px-[5px] py-[6px]">
                    <input type="text"
                      className="outline-none border border-gray-400/90 w-full py-[1px] px-[4px] rounded-[2px]
                      transition focus:border-blue-400 hover:border-blue-300"
                    />
                    <button
                      type="button"
                      className="ml-[3px] hover:bg-gray-200/80 px-[4.5px] cursor-pointer rounded-[3px] transition border border-gray-400/80 bg-gray-100/90"
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
                <div className="h-[400px]">
                  <ul>

                  </ul>
                </div>
              </div>
              {/* arrow */}
              <div className="flex justify-center items-center w-[22px]">
                <svg
                  className="text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 6l6 6l-6 6" />
                </svg>
              </div>
              {/* 선택 영역 */}
              <div className="border border-gray-400 w-[300px]">
                <div className="border-b border-gray-400 bg-blue-100/80 py-[3px] px-[6px] text-[14px]">
                  <h3>등록된 사용자/부서</h3>
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
                handleAddGoupPopup();
            }}>확인</button>
          </div>
        </div>
      </div>
    </div>
  )
}