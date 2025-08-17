'use client'
import { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
// dropdownOptionList에서 option 추가 버튼
export default function AddDropdownOption({
  addDropdownOption,
  dropdownOptions
} : {
  addDropdownOption: (newOption: DropdownOption) => void,
  dropdownOptions: DropdownOption[]
}) {
  const optionNameRef = useRef<HTMLInputElement>(null);
  const [isNameEmpty, setIsNameEmpty] = useState(false);
  const handleAddDropdownOption = () => {
    if (optionNameRef.current?.value.trim() === '') {
      setIsNameEmpty(true);
      setTimeout(() => {
        setIsNameEmpty(false);
      }, 1500)
      return
    }
    addDropdownOption({
      id: uuidv4(),
      order: dropdownOptions.reduce((max, option) => {
        return option.order > max ? option.order : max;
      }, -1) + 1,
      color: '888888',
      name: optionNameRef.current?.value || ''
    });
    // 초기화
    if (optionNameRef.current) {
      optionNameRef.current.value = '';
    }
    setIsNameEmpty(false);
  }
  return (
    <div className={`flex items-center
      border ${isNameEmpty ? "border-red-300" : "border-gray-300/90 has-[input:focus]:border-blue-500 hover:border-gray-400"} rounded-[5px] hover:bg-blue-100/80 py-[3px] mb-[5px] mt-[1px] transition px-[8px] mx-[14px] has-[input:focus]:bg-white`} 
    > 
      <button type="button"
        className="flex items-center justify-center mr-[7px] top-[1px] cursor-pointer hover:bg-blue-100/90 border border-transparent hover:border-blue-200 rounded-[4px] p-[1px] transition"
        onClick={handleAddDropdownOption}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="19" height="19" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor">
          <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"></path>
          <path d="M16.1 12h-8.5"></path>
          <path d="M12 7.8v8.7"></path>
        </svg>
      </button>
      <input ref={optionNameRef} type="text" className="outline-none" placeholder="Type new option"
        onKeyDown={(e) => {
          setIsNameEmpty(false);
          e.key === 'Enter' && handleAddDropdownOption();
        }}
        maxLength={50}
        onFocus={() => setIsNameEmpty(false)}
        onBlur={() => setIsNameEmpty(false)}
      />
    </div>
  )
}