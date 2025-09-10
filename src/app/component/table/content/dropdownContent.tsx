'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom';

export default function DropdownContent({
  containerRef,
  isEditing,
  field,
  value,
  handleUpdateValue,
  setIsEditing
}: {
  containerRef: React.RefObject<HTMLDivElement | null>,
  isEditing: boolean,
  field: TaskField,
  value: string, // option id
  handleUpdateValue: ({newValue}: {newValue: string}) => void,
  setIsEditing: (isEditing: boolean) => void
}) {
  // popup 위치 조정
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const [cellOption, setCellOption] = useState(() => {
    // option 초기값 설정
    const initialOption = field.dropdownOptions?.find(opt => opt.id === value);
    return initialOption ?
      { id: initialOption.id,
        name: initialOption.name,
        color: initialOption.color,
      } : { id: 0, name: '', color: 'ffffff' };
  });

  // 조회모드 option 글자색 변경
  useEffect(() => {
    const newField = field.dropdownOptions?.find(opt => opt.id === value);
    setCellOption({
      id: newField?.id || '',
      name: newField?.name || '',
      color: newField?.color || 'ffffff',
    })
  }, [value, field]);

  // 배경색에 따른 option 글자색 변경 (hexColor: #을 제외한 hex 값)
  const getTextColor = (hexColor: string) => {
    const rgb = parseInt(hexColor, 16) // 10진수 변환
    const r = (rgb >> 16) & 0xff
    const g = (rgb >>  8) & 0xff
    const b = (rgb >>  0) & 0xff
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b // per ITU-R BT.709
    // 색상 선택
    return luma < 170 ? "ffffff" : "171717"
  }

  // 수정모드일 때 popup 위치 조정
  useEffect(() => {
    if (isEditing && divRef.current) {
      const rect = divRef.current.getBoundingClientRect();
      const popupWidth = 190; // 팝업 너비
      const popupHeight = Math.min(202 + 50, (field.dropdownOptions?.length || 0) * 35 + 80); // 대략적인 팝업 높이
      
      // 뷰포트 크기
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let top = rect.bottom + window.scrollY; // 기본: 셀 아래쪽
      let left = rect.left + window.scrollX; // 기본: 셀 왼쪽 정렬
      
      // 세로 위치 조정: 팝업이 화면 아래로 벗어나는 경우 셀 위쪽에 표시
      if (rect.bottom + popupHeight > viewportHeight) {
        top = rect.top + window.scrollY - popupHeight; // 셀 위쪽에 표시
        
        // 위쪽에 표시해도 화면을 벗어나는 경우
        if (top < window.scrollY) {
          // 화면 상단에서 약간의 여백을 두고 표시
          top = window.scrollY;
        }
      }
      
      // 팝업이 오른쪽으로 벗어나는 경우
      if (rect.left + popupWidth > viewportWidth) {
        left = viewportWidth - popupWidth - 1 + window.scrollX; // 화면 오른쪽 경계에 여백을 두고 표시
      }
      
      // 팝업이 왼쪽으로 벗어나는 경우
      if (left < window.scrollX) {
        left = window.scrollX + 1; // 화면 왼쪽 경계에 여백을 두고 표시
      }

      setPopupPos({ top, left });
      setIsPopupOpen(true);
    } else {
      setIsPopupOpen(false);
    }
  }, [isEditing, field.dropdownOptions]);

  // popup 외부 클릭 감지
  const popupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!popupRef.current) return;

      const isOutside = !popupRef.current.contains(target);
      if (isOutside) {
        // 현재 팝업만 닫기
        // e.stopPropagation();
        // e.stopImmediatePropagation();
        setIsPopupOpen(false);
        setIsEditing(false); // 수정모드 종료
      };
    };

    // 팝업이 열려 있을 때만 이벤트 등록
    if (isPopupOpen) {
      document.addEventListener('click', handleClickOutside, true);
    }
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [isPopupOpen]);

  return (
    <div ref={divRef} className='w-full h-full p-[1px]'>
      {
      cellOption.name.trim() ? (
        <div data-option-id={cellOption.id} className="flex items-center justify-center rounded-[3px] h-full w-full px-[8px]" style={{ backgroundColor: `#${cellOption.color}`, color: `#${getTextColor(cellOption.color)}` }}>
          <span className='truncate'>{cellOption.name.trim() ? cellOption.name : '-'}</span>
        </div>
      ) : (
        <div className='flex items-center h-full px-[8px]'>{'-'}</div>
      )}
      { // 수정모드 팝업
      isPopupOpen && createPortal(
        <div
          className='absolute bg-white shadow-[var(--popupShadow)] pt-[6px] pb-[10px] z-[10] rounded-[6px] w-[190px]'
          ref={popupRef}
          style={{
            top: (popupPos?.top || 0) + 8,
            left: (popupPos?.left || 0) - 8,
          }}
        >
          <div className='px-[10px]'>
            <h2 className='text-[13px] font-[500] text-gray-500/90'>Select an option</h2>
          </div>
          {/* 구분 선 */}
          <div className="border-t border-gray-200 h-0 mt-[5px] mb-[8px] mx-[10px]"></div>
          <ul className='flex flex-col max-h-[202px] overflow-y-auto px-[7px] py-[1px] scroll-8px'>
            <li
              className='group outline outline-transparent hover:outline-blue-300 text-center text-[14px] py-[2px] px-[2px] rounded-[4px] cursor-pointer transition'
              onClick={() => {
                handleUpdateValue({ newValue: '' });
              }}
            >
              <div className='group-hover:filter-[brightness(0.94)] py-[3px] border border-gray-200 rounded-[4px] transition' style={{ backgroundColor: `#fff`, color: `#171717` }}>
                {'-'}
              </div>
            </li>
            {[...(field.dropdownOptions) || []].sort((a, b) => a.order - b.order).map((opt) => {
              return (
                <li
                  data-id={opt.id}
                  key={opt.id} className='group outline outline-transparent hover:outline-blue-300 text-center text-[14px] py-[2px] px-[2px] rounded-[4px] cursor-pointer transition' 
                  onClick={() => {
                    handleUpdateValue({ newValue: opt.id });
                  }}
                >
                  <div className='flex items-center group-hover:filter-[brightness(0.94)] py-[4px] rounded-[4px] transition px-[8px]' style={{ backgroundColor: `#${opt.color}`, color: `#${getTextColor(opt.color)}` }}>
                    <span className='truncate inline-block w-full'>{opt.name}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>, document.body
      )}
    </div>
  )
}