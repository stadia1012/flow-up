'use client'
import { useState, useRef, useEffect } from "react";
import SidebarSettingButton from "./sidebarSettingButton";
import { updateListName, moveList } from '@/app/controllers/projectController';
import { useDispatch } from "react-redux";
import { moveFolder, setNameState }  from "@/app/store/projectsSlice";
// drag and drop 관련 import
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { flash } from "@/app/animation";
import DraggableFolder from "./draggableFolder";
import SidebarAddButton from "./sidebarAddButton";

export default function Project({project, dragStateType}: {project : List, dragStateType: string}) {
  const dispatch = useDispatch();
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
        // DB 변경
        await updateListName({
          id: project.id,
          newName: newName,
          type: 'project'
        });
        // redux 변경 (화면 자동반영)
        dispatch(setNameState({
          id: project.id,
          newName: newName,
          type: 'project'
        }));
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

          console.log(`target:`, target);
          console.log(`source:`, source);
          console.log(`s_parent: ${sourceData.parentId}, t_parent: ${targetData.parentId}`);

          // 같은 폴더로의 이동 처리 X (target: project, source: folder인 경우) 
          if ("projectId" in targetData && "folderId" in sourceData && targetData.projectId === sourceData.parentId) return;

          // 유효하지 않은 target
          if (!targetData || !("projectId" in targetData || "folderId" in targetData)) return;

          let updateOrder = 0;

          // case 1 : folder to folder 드래그
          if ("folderId" in targetData) {
            const targetOrder = Number(targetData.order);
            const closestEdge = extractClosestEdge(targetData);
            updateOrder = closestEdge === "top" ? targetOrder : targetOrder + 1;
          } 
          // case 2 : folder to project 드래그
          if ("projectId" in targetData) {
            const maxOrder = Math.max(...folders.map(folder => folder.order), -1) ;
            updateOrder = maxOrder + 1;
          }

          // 동일 폴더에서의 이동 && 후순위로의 이동은 updateOrder -1
          if (
            (("folderId" in targetData && targetData.parentId == sourceData.parentId)
              || ("projectId" in targetData && targetData.projectId == sourceData.parentId)
            ) && updateOrder > Number(sourceData.order)) {
            updateOrder -= 1;
          }

          // redux state 변경
          dispatch(moveFolder({
            sourceParentId: Number(sourceData.parentId),
            targetParentId: project.id,
            sourceId: Number(sourceData.folderId),
            updateOrder: Number(updateOrder)
          }));

          // // DB 변경
          moveList({
            type: 'folder',
            id: Number(sourceData.folderId),
            originalParentId: Number(sourceData.parentId),
            updateParentId: project.id,
            originalOrder: Number(sourceData.order),
            updateOrder: updateOrder
          });

          // 이동 후 flash
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
          <svg style={{color: `${project.iconColor}`}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
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
          <SidebarAddButton addType="folder" parentId={project.id} />
          {/* button -setting */}
          <SidebarSettingButton type="project" handleRename={handleRename} />
        </div>
      </div>
      {
        /* 하위 folder List */
        !isFolded && <div className="relative">
          {
            [...(folders ?? [])].sort((a, b) => (a.order) - (b.order)).map((folder) => (
              <DraggableFolder key={folder.id} folder={folder} />
            ))
          }
        </div>
      }
    </div>
  );
}