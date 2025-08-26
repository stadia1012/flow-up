import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store/store";
import { useDispatch } from "react-redux";
import { showModal } from '@/app/component/modalUtils';
import { useToast } from '@/app/context/ToastContext';
import { moveFolder, moveItem } from '@/app/store/projectsSlice';
import { flash } from '@/app/animation';
import { moveList } from '@/app/controllers/projectController';

interface SidebarAddPopupProps {
  setIsPopupOpen: (isPopupOpen: boolean) => void;
  target: List;
  popupRef: React.RefObject<HTMLDivElement | null>
  targetRef: React.RefObject<HTMLDivElement | null>
}

const typeName = {
  project: "프로젝트",
  folder: "폴더",
  item: "항목"
}

export default function SidebarMovePopup({
  setIsPopupOpen,
  target, // folder 또는 item
  popupRef,
  targetRef
} : SidebarAddPopupProps) {
  // 팝업 위치 
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(() => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const popupWidth = 190; // 팝업 너비
      const popupHeight = Math.min(210);
      
      // 뷰포트 크기
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let top = rect.bottom + window.scrollY; // 기본: target 아래
      let left = rect.left + window.scrollX; // 기본: target 왼쪽
      
      // 세로 위치 조정: 팝업이 화면 아래로 벗어나는 경우 target 위쪽에 표시
      if (rect.bottom + popupHeight > viewportHeight) {
        top = rect.top + window.scrollY - popupHeight; // target 위쪽에 표시
        
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

      return { top, left };
    }
    return null;
  });
  const dispatch = useDispatch();

  // project id
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const projectList = useSelector((state: RootState) =>
    state.projects.projects
  ) as List[];

  const {showToast} = useToast();

  // type별 projectId
  useEffect(() => {
    const type = target.type;
    if (type === "folder") {
      setSelectedProjectId(target.parentId || null);
    }
    if (type === "item") {
      const targetProject = projectList
      .find(project =>
        project.lists?.some(folder => folder.id === target.parentId));
      setSelectedProjectId(targetProject?.id || null);
    }
  }, [projectList]);

  // 폴더 select
  useEffect(() => {
    if (folderSelectRef.current) {
      const targetValue = target.parentId?.toString() || '';

      const options = Array.from(folderSelectRef.current.options);
      const hasMatchingOption = options.some(option => option.value === targetValue);

      // 옵션이 있을 때만 값 설정
      if (hasMatchingOption) {
        folderSelectRef.current.value = targetValue;
      }
    }
  }, [selectedProjectId])

  // input List
  const projectSelectRef = useRef<HTMLSelectElement>(null);
  const folderSelectRef = useRef<HTMLSelectElement>(null);

  // 이동 처리
  const moveTaskItem = async () => {
    if (!target.parentId) return;
    if (!projectSelectRef.current) return;
    if (target.type === 'item' && !folderSelectRef.current) return;

    // redux store 변경
    if (target.type === 'folder') {
      dispatch(moveFolder({
        sourceParentId: target.parentId,
        targetParentId: Number(projectSelectRef.current.value),
        sourceId: target.id,
        updateOrder: -1
      }));
    }

    if (target.type === 'item') {
      dispatch(moveItem({
        sourceParentId: target.parentId,
        targetParentId: Number(folderSelectRef.current!.value),
        sourceId: target.id,
        updateOrder: -1
      }));
    }

    const updateParentId = target.type === "folder"
      ? Number(projectSelectRef.current.value)
      : Number(folderSelectRef.current!.value)

    // DB 변경
    moveList({
      type: target.type,
      id: target.id,
      originalParentId: target.parentId,
      updateParentId: updateParentId,
      originalOrder: target.order,
      updateOrder: -1
    });
    
    // 이동 후 flash
    const element = document.querySelector(`[data-${target.type}-wrapper="${target.id}"]`);
    if (element) {
      setTimeout(() => {
        flash(element);
      }, 100)
    }
   
    showToast(`이동되었습니다.`, 'success');
  }

  return (
    <div className='absolute' style={{
      top: (popupPos?.top || 0) + 8,
      left: (popupPos?.left || 0) - 8,
    }}>
      <div
        className="relative bg-white p-[10px] pl-[18px] pr-[18px] rounded-[6px] shadow-[var(--popupShadow)] cursor-default z-3 popup-menu w-[230px] pb-[10px]"
        ref={popupRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='relative'>
          <h2 className="text-center font-semibold">{`${typeName[target.type]} 이동`}</h2>
          <button
            className='absolute top-[-2px] right-[-10px] hover:bg-gray-200/65 rounded-[3px]'
            onClick={(e) => {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
              setIsPopupOpen(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" strokeWidth="2">
              <path d="M18 6l-12 12"></path>
              <path d="M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        {/* location */}
        { ["folder", "item"].includes(target.type) &&
        <div className='mt-[8px]'>
          <div className='text-[13px] font-semibold mb-[1px]'>Location</div>
          {/* project list */}
          <select
            className='border-[1px] rounded-[3px] border-gray-400 w-full h-[23px] focus:border-blue-400 focus-visible:outline-none text-[13px]'
            value={selectedProjectId || 0}
            ref={projectSelectRef}
            onChange={(e) => {
              setSelectedProjectId(Number(e.target.value));
            }}
          >
            {
              projectList.map((p) => (
                <option key={p.id} value={p.id} className='text-[13px]'>
                  {p.name}
                </option>
              ))
            }
          </select>
          {/* folder list */
          target.type === "item" &&
          <select
            className='border-[1px] rounded-[3px] border-gray-400 min-w-full h-[23px] focus:border-blue-400 focus-visible:outline-none text-[13px] mt-[5px]'
            defaultValue={target.parentId}
            ref={folderSelectRef}
          >
            {
              projectList.find((p) => p.id === selectedProjectId)?.lists?.map(f => (
                <option key={f.id} value={f.id} className='text-[13px]'>
                  {f.name}
                </option>
              ))
            }
          </select>
          }
        </div>
        }
        <div className='flex mt-[5px]'>
          <button
            className='dft-apply-btn ml-auto pt-[4px] pb-[4px] pl-[10px] pr-[10px]'
            onClick={(e) => {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
              moveTaskItem();
            }}
          >이동</button>
        </div>
      </div>
    </div>
  );
}