'use client'
import { useState, useEffect, useRef, MouseEventHandler } from 'react'

export default function NumberContent({
  isEditing,
  field,
  value,
  handleUpdateValue,
  setIsEditing
}: { 
  isEditing: boolean,
  field: TaskField,
  value: string,
  handleUpdateValue: ({newValue}: {newValue: string}) => void,
  setIsEditing: (isEditing: boolean) => void
}) {
  const [cellValue, setCellValue] = useState(value ?? '');

  const inputRef = useRef<HTMLInputElement | null>(null);
  // 자동 focus
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // 컴마 추가
  const addCommas = (number: number | string) => {
    // 숫자를 문자열로 변환하고 소수점 처리
    const numStr = number.toString();
    const parts = numStr.split(".");
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
  }

   // 컴마 제거
  const removeCommas = (str: string) => {
    return (Number(str.replace(/,/g, ''))).toString();
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // 숫자만 추출, 음수 허용
    const numbersOnly = (inputValue === '-' || inputValue === '0-' || inputValue === '-0')
      ? '-'
      : (Number(inputValue.replace(/[^0-9.-]/g, ''))).toString()
    
    // 빈 값이면 그대로 설정
    if (numbersOnly === '' || numbersOnly === '-') {
      setCellValue(numbersOnly);
      return;
    }
    
    // 유효한 숫자인지 확인
    const numericValue = parseFloat(removeCommas(numbersOnly));
    if (!isNaN(numericValue)) {
      // 컴마 추가하여 표시
      const formattedValue = addCommas(numbersOnly);
      setCellValue(formattedValue);
    } else {
      // 이전 값 유지
      if (cellValue === '-') setCellValue('0');
      setCellValue(cellValue);
    }
  }

  return (
    <div className={`${(field.type === 'name') && 'font-[500]'}`}>
      { isEditing ? (
        // 수정모드
        <input
          type='text'
          className='w-full outline-none text-blue-600 text-right'
          value={addCommas(cellValue)}
          onChange={(e) => handleChange(e)}
          onBlur={(e) => {handleUpdateValue({newValue: removeCommas(cellValue)})}}
          ref={inputRef}
          autoComplete='off'
          spellCheck='false'
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleUpdateValue({newValue: (e.target as HTMLInputElement).value});
            if (e.key === 'Escape') setIsEditing(false);
          }}
          maxLength={200}
        />
      ) : (
        // 조회모드
        <div className={`truncate w-full text-right`}>
          {!cellValue || cellValue === '-' ? '0' : addCommas(cellValue)}
        </div>
      )}
    </div>
  )
}