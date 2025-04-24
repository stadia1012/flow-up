'use client'
import { useState } from "react";

interface ColorPanelProps {
  hex: string,
  selected?: boolean,
  onSelect?: (hex: string) => void
} 
const ColorPanel = ({ hex, selected, onSelect } : ColorPanelProps ) => {
  return (
    <div
      className="inline-block"
      onClick={() => {onSelect && onSelect(hex); console.log('panel')} }
    >
      <button className={`rounded-full w-[22px] h-[22px] border-transparent border-[1px] hover:border-gray-400/80 p-[3px] cursor-pointer`} style={{borderColor: selected ? '#3c7fff' : ''}}>
        <span className='block rounded-full w-full h-full' style={{backgroundColor: `#${hex}`}}></span>
      </button>
    </div>
  )
}

interface ColorPickerProps {
  hex: string;
  colorPopupRef: React.RefObject<HTMLDivElement | null>;
  setIsColorPopupOpen: (isColorPopupOpen: boolean) => void;
  applyColor: (hex: string) => void;
}
export default function ColorPicker({hex, colorPopupRef, setIsColorPopupOpen, applyColor} : ColorPickerProps) {
  const [selectedHex, setSelectedHex] = useState(hex);
  const defaultColors = [
    '000000','ff0000','ffa500','f9d900','008000','0050ff','000080','800080','808080','ffc0cb','ff69b4','a52A2a','00ff00','40e0d0','87ceeb',
  ];
  return (
    <div
      className="absolute bg-white p-[10px] pl-[18px] pr-[18px] rounded-[6px] shadow-[var(--popupShadow)] cursor-default z-3 popup-menu w-[230px] pb-[10px] w-[250px] top-[30px]"
      onClick={(e) => e.stopPropagation()}
      ref={colorPopupRef}
    >
      <div className="pb-[5px] relative">
        <h2 className="text-[13px] font-[600]">Color 선택</h2>
        <button
          className='absolute top-[-2px] right-[-10px] hover:bg-gray-200/65 rounded-[3px]'
          onClick={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            setIsColorPopupOpen(false);
          }}
        >
          <svg
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" strokeWidth="2">
            <path d="M18 6l-12 12"></path>
            <path d="M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div className="flex items-center border-gray-400/80 border-b-[1px] pt-[5px] pb-[8px] leading-[100%]">
        <div className="relative top-[0px]">
          <ColorPanel hex={selectedHex} selected={true} />
        </div>
        <span className="flex ml-[5px] text-[13px] justify-center items-center text-[#333333] leading-[100%]">
          <span className="font-[600]">#</span>
          <input
            type="text"
            className="inline-block ml-[2px] outline-none text-center text-[13px] text-[#333333] border-[1px] border-[#808080] p-[2px] w-[58px] rounded-[3px] leading-[100%] bg-gray-100/50"
            value={selectedHex}
            onChange={(e) => {
              const newHex = e.target.value.replace(/[^0-9a-f]/gi, ''); // 16진수만 허용
              setSelectedHex(newHex);
            }}
            maxLength={6}
          />
        </span>
        <button type="button" className="ml-[6px] rounded-full hover:bg-gray-200/80 p-[2px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" strokeWidth="1.5">
            <path d="M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25"></path>
            <path d="M8.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
            <path d="M12.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
            <path d="M16.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
          </svg>
        </button>
      </div>
      <div className="pt-[5px]">
        <ul className="flex gap-[2px] flex-wrap">
          {
            defaultColors.map(c => (
              <li key={c}>
                <ColorPanel
                  hex={c}
                  selected={c === selectedHex}
                  onSelect={setSelectedHex}
                />
              </li>
            ))
          }
        </ul>
      </div>
      <div className='flex mt-[5px]'>
        <button
          className='dft-apply-btn ml-auto pt-[4px] pb-[4px] pl-[10px] pr-[10px]'
          onClick={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            applyColor(selectedHex);
          }}
        >적용</button>
      </div>
    </div>
  );
}