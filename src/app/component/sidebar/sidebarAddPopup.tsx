import { useState, Ref, useEffect } from 'react';
import ColorPicker from './colorPicker'

interface SidebarAddPopupProps {
  popupRef: Ref<HTMLDivElement>;
  addType: ListType;
  setIsPopupOpen: (isOpen: boolean) => void;
}

const typeName = {
  project: "프로젝트",
  folder: "폴더",
  item: "아이템"
}

export default function SidebarAddPopup({popupRef, addType, setIsPopupOpen} : SidebarAddPopupProps) {
  const [iconColor, setIconColor] = useState("000000");
  const [isColorPopupOpen, setIsColorPopupOpen] = useState(false);
  const handleIsColorPopupOpen = () => {
    setIsColorPopupOpen(prev => !prev);
  }
  return (
    <div
      className="absolute bg-white p-[10px] pl-[18px] pr-[18px] rounded-[6px] shadow-[var(--popupShadow)] cursor-default z-3 popup-menu w-[230px] pb-[10px]"
      ref={popupRef}
      onClick={(e) => e.stopPropagation()}
    >
      <div className='relative'>
        <h2 className="text-center font-semibold">{`${typeName[addType]} 추가`}</h2>
        <button className='absolute top-[-2px] right-[-10px]'>
          <svg
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" strokeWidth="2">
            <path d="M18 6l-12 12"></path>
            <path d="M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      {/* name */}
      <div className='mt-[5px]'>
        <div className='text-[13px] font-semibold mb-[1px]'>Name</div>
        <input type="text" className='w-full bg-white px-[6px] py-[0px] outline-solid outline-gray-400 outline-1 rounded-[3px] focus:outline-blue-400' />
      </div>
      {/* color */}
      <div className='mt-[10px]'>
        <div className='text-[13px] font-semibold mb-[1px]'>Color</div>
        <div className='flex relative mt-[3px]'>
          {/* color 미리보기 */}
          <div className='inline-block rounded-full w-[22px] h-[22px] border-[1px] border-[#3c7fff] p-[3px]'>
            <span className='block rounded-full w-full h-full' style={{backgroundColor: `#${iconColor}`}}></span>
          </div>
          {/* color Edit button */}
          <button
            className='relative flex icon-color-selector ml-[10px] mt-[1px] border-gray-400 border-[1px] hover:border-[#777777] rounded-[3px] p-[1px] pl-[6px] pr-[6px] text-[#555] hover:text-[#195eff] font-[500] text-[12px] transition-all top-[-1px]'
            onClick={handleIsColorPopupOpen}
          >
            <span className='relative top-[1.5px]'>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="14.5" height="14.5" strokeWidth="2">
                <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"></path>
                <path d="M13.5 6.5l4 4"></path>
              </svg>
            </span>
            <span className='ml-[2px]'>Edit</span>
          </button>
          {isColorPopupOpen && <ColorPicker hex={iconColor} />}
        </div>
      </div>
      <div className='flex mt-[5px]'>
        <button className='dft-apply-btn ml-auto pt-[4px] pb-[4px] pl-[10px] pr-[10px]'>추가</button>
      </div>
    </div>
  );
}