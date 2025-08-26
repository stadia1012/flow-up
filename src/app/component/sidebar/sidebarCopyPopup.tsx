import { useState, useRef, useEffect } from 'react';
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store/store";
import { useDispatch } from "react-redux";
import { showModal } from '@/app/component/modalUtils';
import { useToast } from '@/app/context/ToastContext';
import { addItemToStore, moveFolder, moveItem } from '@/app/store/projectsSlice';
import { flash } from '@/app/animation';
import { copyItemFromDB, moveList } from '@/app/controllers/projectController';

export default function SidebarCopyPopup({originalItem, setIsPopupOpen}: {
  originalItem: List,
  setIsPopupOpen: (arg: boolean) => void
}) {
  const dispatch = useDispatch();
  const [copyOption, setCopyOption] = useState('noData');
  const folderRef = useRef<HTMLSelectElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const projectList = useSelector((state: RootState) =>
    state.projects.projects
  ) as List[];

  const {showToast} = useToast();

  // 복사 처리
  const duplicateTaskItem = async () => {
    if (!['withData', 'noData'].includes(copyOption)) {
      return;
    }
    if (!folderRef.current || !folderRef.current.value) {
      showToast(`폴더를 선택해주세요.`, 'error');
      return;
    }
    if (!nameRef.current || !nameRef.current.value) {
      showToast(`이름을 입력해주세요.`, 'error');
      return;
    }
    
    try {
      // DB 처리
      const result = await copyItemFromDB({
        originalItemId: originalItem.id,
        folderId: Number(folderRef.current.value),
        newName: nameRef.current.value,
        copyOption: copyOption,
      });

      if (result.success && result.newItem) {
        const newItem = result.newItem;
        dispatch(addItemToStore({
          id: Number(newItem.ID),
          addType: 'item',
          name: newItem.NAME ?? 'new Item',
          order: Number(newItem.ORDER),
          iconColor: newItem.ICON_COLOR ?? '000000',
          parentId: Number(newItem.PARENT_ID) ?? 0
        }));
        showToast(`복사되었습니다.`, 'success');
        
      } else {
        showToast(result.error || `복사 중 오류가 발생했습니다.`, 'error');
      }
      
    } catch (error) {
      console.error('복사 요청 실패:', error);
      showToast(`오류가 발생했습니다.`, 'error');
      throw error;
    }
  }

  return (
    <div className='absolute top-0 left-0 h-full w-full bg-gray-400/45 z-[10]'
      onClick={(e) => {e.stopPropagation(); setIsPopupOpen(false);}}
    >
      <div
        className="
          relative top-[20%] left-[50%] translate-y-[-20%] translate-x-[-50%] 
          bg-white py-[15px] px-[30px] rounded-[6px] shadow-[var(--popupShadow)] cursor-default z-3 popup-menu w-[450px]
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div className='relative py-[3px]'>
          <h2 className="text-center text-[15px] font-[500]">{`항목 복사`}</h2>
        </div>
        <div className='flex flex-col mt-[5px]'>
          <div className='flex flex-col'>
            <div className='text-[14px] flex flex-col mb-[20px]'>
              <label className='font-[500] pb-[3px]'>새 항목 이름</label>
              <input
                ref={nameRef}
                type='text' className='bg-white border border-gray-400/70 hover:border-gray-400 outline-none focus:border-blue-400 rounded-[3px] px-[6px] py-[2px] transition' defaultValue={`${originalItem.name} 복사본`}
                autoComplete="off"
                spellCheck="false"
                maxLength={50}
              ></input>
            </div>
            <div className='text-[14px] flex flex-col mb-[20px]'>
              <label className='font-[500] pb-[3px]'>위치</label>
              <select
                ref={folderRef}
                className='border-[1px] rounded-[3px] border-gray-400/70 hover:border-gray-400 w-full h-[28px] focus:border-blue-400 focus-visible:outline-none text-[13px]'
              >
                {
                  projectList.flatMap((p) => p.lists || []).map((folder) => (
                    <option key={folder.id} value={folder.id} className='text-[13px]'>
                      {folder.name}
                    </option>
                  ))
                }
              </select>
            </div>
            <div className='text-[14px] flex flex-col mb-[20px]'>
              <label className='font-[500] pb-[3px]'>값을 포함해 복사할까요?</label>
              <div className='border border-gray-300 rounded-[5px] p-[8px]'>
                <div className='flex align-center'>
                  <input
                    id="withData" type='radio' name='copyOption' value='withData' className='mr-[10px]'
                    checked={copyOption === 'withData'}
                    onChange={(e) => setCopyOption(e.target.value)}></input>
                  <label htmlFor='withData' className='text-gray-600 cursor-pointer'>포함</label>
                </div>
                <div className='flex align-center'>
                  <input
                    id="noData" type='radio' name='copyOption' value='noData' className='mr-[10px]'
                    checked={copyOption === 'noData'}
                    onChange={(e) => setCopyOption(e.target.value)}
                  ></input>
                  <label htmlFor='noData' className='text-gray-600 cursor-pointer'>미포함</label>
                </div>
              </div>
            </div>
          </div>
          <div className='flex ml-auto'>
            <button
              className='dft-btn pt-[4px] pb-[4px] pl-[10px] pr-[10px] mr-[5px]'
              onClick={(e) => {
                e.stopPropagation();
                setIsPopupOpen(false);
              }}
            >취소</button>
            <button
              className='dft-apply-btn pt-[4px] pb-[4px] pl-[12px] pr-[12px]'
              onClick={(e) => {
                e.stopPropagation();
                duplicateTaskItem();
                setIsPopupOpen(false);
              }}
            >복사</button>
          </div>
        </div>
      </div>
    </div>
  );
}