'use client'

export default function Item({item}: {item: List}) {
  return (
    <div className={`group flex items-center p-[2px] pl-6 cursor-pointer hover:bg-gray-200/65 rounded-[5px] h-[30px]`}>
      {/* 폴더 아이콘 */}
      <div className="w-[22px] h-[22px] p-[2.3px] hover:bg-gray-300 transition-all mr-[7px] rounded-[4px]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
          <path d="M9 6l11 0"></path>
          <path d="M9 12l11 0"></path>
          <path d="M9 18l11 0"></path>
          <path d="M5 6l0 .01"></path>
          <path d="M5 12l0 .01"></path>
          <path d="M5 18l0 .01"></path>
        </svg>
      </div>
      {/* 폴더 이름 */}
      <span className="relative top-[1px]">{item.name}</span>
      {/* 버튼 */}
      <div className="flex p-[3px] ml-auto items-center hidden group-hover:flex">
        <div className="w-[22px] h-[22px] p-[3px] hover:bg-gray-300 rounded-[7px] transition-all">
          <svg className="w-full h-full relative top-[1px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" strokeWidth="2">
            <path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
            <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
            <path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}