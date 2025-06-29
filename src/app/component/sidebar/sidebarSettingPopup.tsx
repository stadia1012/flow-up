import { showModal } from '@/app/component/modalUtils';
import { deleteItemFromDB } from '@/app/controllers/projectController';
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/app/store/store";
import { deleteItemFromStore }  from "@/app/store/projectsSlice";
import { useToast } from '@/app/context/ToastContext';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SidebarMovePopup from './sidebarMovePopup';
interface SidebarSettingPopupProps {
  popupRef: React.RefObject<HTMLDivElement | null>;
  type: ListType;
  handleRename?: () => void;
  setIsPopupOpen: (isOpen: boolean) => void;
  item: List;
}

export default function SidebarSettingPopup({
  popupRef,
  type,
  handleRename,
  setIsPopupOpen,
  item
} : SidebarSettingPopupProps) {
  const dispatch: AppDispatch = useDispatch();
  const {showToast} = useToast();
  const [isMovePopupOpen, setIsMovePopupOpen] = useState(false);

  const handleDelete = async () => {
    let title = `'${item.name}'을(를) 삭제하시겠습니까?`;
    if (['project', 'folder'].includes(type)) {
      title += `\n하위 항목도 모두 삭제됩니다.`;
    }
    try {
      await showModal({
        type: 'delete',
        title: title
      });

      // 삭제 처리 (DB)
      await deleteItemFromDB({
        itemType: item.type,
        itemId: item.id,
      })

      // 삭제 처리 (store)
      dispatch(deleteItemFromStore({
        itemType: item.type,
        itemId: item.id,
      }))
      showToast('삭제되었습니다.', 'success');

    } catch {
      console.log('사용자 취소');
    }
  };

  // move popup 외부 클릭 감지
  const MovePopupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!MovePopupRef.current) return;

      const isOutside = !MovePopupRef.current.contains(target);
      if (isOutside) {
        // stop: 현재 팝업만 닫기
        //e.stopPropagation();
        //e.stopImmediatePropagation();
        setIsMovePopupOpen(false)
      };
    };

    // 팝업이 열려 있을 때만 이벤트 등록
    if (isMovePopupOpen) {
      document.addEventListener('click', handleClickOutside, true);
    }
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [isMovePopupOpen]);
  const settingBtnRef = useRef<HTMLDivElement>(null)

  return (
    <div className="absolute bg-white p-[10px] pl-[7px] pr-[7px] rounded-[6px] shadow-[var(--popupShadow)] cursor-default z-3 popup-menu" ref={popupRef} onClick={(e) => e.stopPropagation()}>
      {/* 이름 변경 */}
      <div
        className="flex items-center hover:bg-gray-200/65 rounded-[4px] p-[8px] pt-[3px] pb-[3px] cursor-pointer"
        style={{transition:'background-color 0.15s'}}
        onClick={(e) => {
          e.stopPropagation();
          handleRename?.();
          setIsPopupOpen(false);
        }}
      >
        {/* 설정 아이콘 */}
        <div className="relative top-[-1px] w-[19px] h-[19px] mr-[8px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"></path>
            <path d="M13.5 6.5l4 4"></path>
          </svg>
        </div>
        {/* 설정 이름 */}
        <div className="w-[100px]">이름 변경</div>
      </div>
      {/* 이동 */}
      {type !== 'project' &&
        <div
          className="flex items-center hover:bg-gray-200/65 rounded-[4px] p-[8px] pt-[3px] pb-[3px] cursor-pointer"
          onClick={() => {
            setIsMovePopupOpen(prev => !prev);
            //setIsPopupOpen(false);
          }}
        >
        {/* 설정 아이콘 */}
        <div ref={settingBtnRef} className="relative top-[-1px] w-[19px] h-[19px] mr-[8px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
            <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
            <path d="M9 15h6"></path>
            <path d="M12.5 17.5l2.5 -2.5l-2.5 -2.5"></path>
          </svg>
        </div>
        {/* 설정 이름 */}
        <div className="w-[100px]">이동</div>
        {/* 이동 팝업 */
          isMovePopupOpen && createPortal(
            <SidebarMovePopup target={item} setIsPopupOpen={setIsMovePopupOpen} popupRef={MovePopupRef} targetRef={settingBtnRef} />
            , document.body
          )
        }
      </div>}
      {/* 삭제 */}
      <div
        className="flex items-center hover:bg-gray-200/65 rounded-[4px] p-[8px] pt-[3px] pb-[3px] cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
      >
        {/* 설정 아이콘 */}
        <div className="relative top-[-1px] w-[19px] h-[19px] mr-[8px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M4 7l16 0"></path>
            <path d="M10 11l0 6"></path>
            <path d="M14 11l0 6"></path>
            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
          </svg>
        </div>
        {/* 설정 이름 */}
        <div
          className="w-[100px]"
        >삭제</div>
      </div>
    </div>
  );
}