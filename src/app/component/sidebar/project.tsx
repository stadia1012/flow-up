'use client'
import { useState, useRef, useEffect } from "react";
import SidebarSettingButton from "./sidebarSettingButton";
import { updateProjectName } from '@/app/controllers/projectController';
// drag and drop 관련 import
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { flushSync } from "react-dom";
import { triggerPostMoveFlash } from "@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash";
import DraggableFolder from "./draggableFolder";

export default function Project({project}: {project: List}) {
  const [isFolded, setIsFolded] = useState(project.isFolded); // 폴더 펼치기/접기
  const [isRename, setIsRename] = useState(false); // 이름변경 모드 여부
  const [projectName, setProjectName] = useState(project.name); // 이름 state
  const renameRef = useRef<HTMLInputElement>(null); // 이름변경 input ref

  const [folders, setFolders] = useState(project.lists); // 하위 폴더들
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (isRename && renameRef.current) {
      renameRef.current.focus();
    }
  }, [isRename]);

  const handleRename = () => {
    setIsRename(prev => !prev);
  }
  // 이름변경 input에서 Enter키 입력 시
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  }

  const handleBlur = async () => {
    if (renameRef.current) {
      const newName = renameRef.current.value;
      try {
        await updateProjectName(project.id, newName);
        console.log('프로젝트 이름 업데이트 성공:', newName);
        setProjectName(newName);
      } catch (error) {
        console.error('프로젝트 이름 업데이트 실패:', error);
      } finally {
        handleRename();
      }
    }
  };

  // 드래그 앤 드롭
  useEffect(() => {
    console.log('project dnd');
    const container = containerRef.current;
    if (!container) return;
    if (!folders) return;

    // 컨테이너 수준의 dropTarget 등록
    return dropTargetForElements({
      element: container,
      canDrop({ source }) {
        return source.data && "folderId" in source.data;
      },
      onDrop({ source, location }) {
        const sourceData = source.data;
        if (!sourceData || !("folderId" in sourceData)) return;

        // 컨테이너 하위에 등록된 각 항목의 dropTarget 중 하나가 타겟으로 선택
        const target = location.current.dropTargets[0];
        if (!target) return;

        const targetData = target.data;
        if (!targetData || !("folderId" in targetData)) return;

        const sourceIndex = folders?.findIndex((p) => p.id === sourceData.folderId);
        const targetIndex = folders?.findIndex((p) => p.id === targetData.folderId);
        if (sourceIndex < 0 || targetIndex < 0) return;

        const closestEdge = extractClosestEdge(targetData);
        flushSync(() => {
          setFolders(
            reorderWithEdge({
              list: folders,
              startIndex: sourceIndex,
              indexOfTarget: targetIndex,
              closestEdgeOfTarget: closestEdge,
              axis: "vertical",
            })
          );
        });

        // 드롭 후 해당 요소에 플래시 효과 적용
        const element = document.querySelector(`[data-folder-id="${sourceData.folderId}"]`);
        if (element instanceof HTMLElement) {
          triggerPostMoveFlash(element);
        }
      },
    });
  }, [folders, isFolded]); // 펼쳤을때 containerRef가 렌더링 되므로 isFolded 필요

  return (
    <>
      <div className={`group folder flex items-center p-[2px] pl-1 cursor-default rounded-[5px] h-[30px] w-full hover:bg-gray-200/65 has-[.popup-menu]:bg-gray-200/65`}>
        {/* 폴더 아이콘 */}
        <div className="basis-[22px] h-[22px] p-[1.8px] hover:bg-gray-300 transition-all cursor-pointer mr-[7px] rounded-[4px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z"></path>
            <path d="M3 10h18"></path>
            <path d="M10 3v18"></path>
          </svg>
        </div>
        {/* 폴더 이름 */}
        { isRename ? ( /* 이름변경 시 */
            <div className="flex-1 rename peer">
              <input
                type="text"
                className="w-full px-[6px] py-[0px] outline-solid outline-gray-400 outline-1 rounded-[3px] bg-white"
                defaultValue={projectName}
                onBlur={handleBlur}
                ref={renameRef}
                onKeyDown={handleKeyDown} />
            </div>
          ) : (
            <span className="relative top-[1px] cursor-pointer min-w-[80px] flex-1" onClick={() => setIsFolded(!isFolded)}>{projectName}</span>
          )
        }

        {/* button wrapper */}
        <div className="relative p-[3px] basis-[50px] items-center hidden group-hover:flex has-[.popup-menu]:flex peer-[.rename]:flex peer-[.rename]:opacity-0 peer-[.rename]:pointer-events-none">
          {/* button - add */}
          <div className="w-[22px] h-[22px] p-[3px] hover:bg-gray-300 rounded-[7px] transition-all cursor-pointer" onClick={(e) => { e.stopPropagation(); }}>
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" strokeWidth="2">
              <path d="M12 5l0 14"></path>
              <path d="M5 12l14 0"></path>
            </svg>
          </div>
          {/* button -setting */}
          <SidebarSettingButton type="project" handleRename={handleRename} />
        </div>
      </div>
      {
        /* 하위 폴더 List */
        !isFolded && <div ref={containerRef} className="relative">
          {folders?.map((folder) => (
            <DraggableFolder key={folder.id} folder={folder} />
          ))}
        </div> 
      }
    </>
  );
}