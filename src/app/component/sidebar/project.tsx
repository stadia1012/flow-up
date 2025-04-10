'use client'
import { useState, useRef, useEffect } from "react";
import SidebarSettingButton from "./sidebarSettingButton";
import { updateListName } from '@/app/controllers/projectController';
import { useSelector, useDispatch } from "react-redux";
import { moveFolder }  from "@/app/store/projectsSlice";
import type { RootState, AppDispatch } from "@/app/store/store";
// drag and drop 관련 import
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { flushSync } from "react-dom";
import { flash } from "@/app/animation";
import DraggableFolder from "./draggableFolder";

export default function Project({project, dragStateType}: {project : List, dragStateType: string}) {
  const dispatch: AppDispatch = useDispatch();
  //const project = useSelector((state: RootState) =>
  //   state.projects.projects.find((p) => p.id === projectId)
  // ) as List;
  const [isFolded, setIsFolded] = useState(true); // 폴더 펼치기/접기
  const [isRename, setIsRename] = useState(false); // 이름변경 모드 여부
  const [projectName, setProjectName] = useState(project ? project.name : ""); // 이름 state
  const renameRef = useRef<HTMLInputElement>(null); // 이름변경 input ref
  const [folders, setFolders] = useState(project ? project.lists : []); // 하위 폴더들
  const containerRef = useRef<HTMLDivElement | null>(null);

  // project 업데이트 시 
  useEffect(() => {
    if (project) {
      setProjectName(project.name);
      setFolders(project.lists);
    }
  }, [project]);
  
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
    if (e.key === "Escape") {
      if (!renameRef.current) return;
      handleRename();
      renameRef.current.value = projectName;
    }
  }

  const handleBlur = async () => {
    if (renameRef.current) {
      const newName = renameRef.current.value;
      try {
        await updateListName({
          id: project.id,
          newName: newName,
          type: 'project'
        });
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
    const container = containerRef.current;
    if (!container || !folders) return;

    const registerDropTarget = async () => {
      return dropTargetForElements({
        element: container,
        canDrop({ source }) {
          return source.data && "folderId" in source.data;
        },
        onDrop: async ({ source, location }) => {
          const sourceData = source.data;
          if (!sourceData || !("folderId" in sourceData)) return;
  
          //const target = location.current.dropTargets[0];
          const target = location.current.dropTargets.find(t => 'projectId' in t.data || 'folderId' in t.data);

          if (!target) return;
          const targetData = target.data;
          // 같은 폴더로의 이동 처리 X (target: project, source: folder인 경우) 
          if ("projectId" in sourceData && "folderId" in sourceData && targetData.id === sourceData.parentId) return;

          console.log(`target:`, target);
          console.log(`source:`, source);
          
          if (!targetData || !("projectId" in targetData || "folderId" in targetData)) return;
          
          if ("folderId" in targetData) {
            // folder to folder 드래그
            const sourceIndex = folders.findIndex((p) => p.id === sourceData.folderId);
            const targetIndex = folders.findIndex((p) => p.id === targetData.folderId);
    
            if (targetIndex < 0) return;
            const closestEdge = extractClosestEdge(targetData);
    
            console.log(`s: ${sourceData.parentId}, t: ${targetData.parentId}`);
            if (sourceData.parentId !== targetData.parentId) {
              // 외부 폴더에서의 드롭은 redux로 처리
              const newIndex = closestEdge === "top" ? targetIndex : targetIndex + 1;

              dispatch(moveFolder({
                sourceParentId: Number(sourceData.parentId),
                targetParentId: project.id,
                sourceId: Number(sourceData.folderId),
                targetIndex: Number(newIndex)
              }));
            } else {
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
            }
          }
          if ("projectId" in targetData) {
            // folder to project 드래그
            dispatch(moveFolder({
              sourceParentId: Number(sourceData.parentId),
              targetParentId: project.id,
              sourceId: Number(sourceData.folderId),
              targetIndex: 0 // top에 드롭
            }));
          }
          const element :Element | null = document.querySelector(`[data-folder-wrapper="${sourceData.folderId}"]`);
          if (element instanceof Element) {
            setTimeout(() => {
              flash(element);
            }, 10)
          }
        },
      });
    };
    registerDropTarget();
  }, [folders]);

  return (
    <div ref={containerRef} >
      <div
        className={`group folder flex items-center p-[2px] pl-1 cursor-default rounded-[5px] h-[30px] w-full hover:bg-[#ecedf1] has-[.popup-menu]:bg-[#ecedf1] transition-colors ${dragStateType === "dragging-folder-over" ? "bg-blue-100/70" : ""}`}>
        {/* 폴더 아이콘 */}
        <div className="basis-[22px] h-[22px] p-[1.8px] hover:bg-gray-300 transition-all cursor-pointer mr-[7px] rounded-[4px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z"></path>
            <path d="M3 10h18"></path>
            <path d="M10 3v18"></path>
          </svg>
        </div>
        {/* 프로젝트 이름 */}
        { isRename ? ( /* 이름변경 시 */
            <div className="flex-1 rename peer">
              <input
                type="text"
                className="w-full px-[6px] py-[0px] outline-solid outline-gray-400 outline-1 rounded-[3px] bg-white"
                defaultValue={projectName}
                onBlur={handleBlur}
                ref={renameRef}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck="false"
                />
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
        /* 하위 folder List */
        !isFolded && <div className="relative">
          {folders?.map((folder) => (
            <DraggableFolder key={folder.id} folder={folder} />
          ))}
        </div>
      }
    </div>
  );
}