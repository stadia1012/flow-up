'use client'
import { useState, useRef, useEffect } from "react";
import SidebarSettingButton from "./sidebarSettingButton";
import { updateListName, moveList, updateItemIconColor } from '@/app/controllers/projectController';
import { useDispatch } from "react-redux";
import { moveItem, setIsFoldedState, setNameState, setIconColorState }  from "@/app/store/projectsSlice";
import type { AppDispatch } from "@/app/store/store";
// drag and drop 관련 import
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { flash } from "@/app/animation";
import DraggableItem from "./draggableItem";
import SidebarAddButton from "./sidebarAddButton";
import ColorPicker from '../colorPicker';

export default function Folder({folder, dragStateType, project}: {folder: List, dragStateType: string, project: List}) {
  const dispatch: AppDispatch = useDispatch();
  const [isFolded, setIsFolded] = useState(folder.isFolded);
  const [isRename, setIsRename] = useState(false); // 이름변경 모드 여부
  const [folderName, setFolderName] = useState(folder.name); // 이름 state
  let state = isFolded ? "folded" : "unfolded";
  const renameRef = useRef<HTMLInputElement>(null); // 이름변경 input ref
  const [items, setItems] = useState(folder ? folder.lists : []); // 하위 폴더들
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isColorPopupOpen, setIsColorPopupOpen] = useState(false);

  // folder 업데이트 시 
  useEffect(() => {
    if (folder) {
      setFolderName(folder.name);
      setItems(folder.lists);
    }
  }, [folder]);

  // iconColor 변경
  const toggleColorPopup = () => {
    setIsColorPopupOpen(prev => !prev);
  }
  const applyColor = (hex: string) => {
    setIsColorPopupOpen(false);
    // redux update
    dispatch(setIconColorState({
      type: 'folder',
      id: folder.id,
      newHex : hex
    }));
    // db update
    updateItemIconColor({
      type: 'folder',
      id: folder.id,
      newHex: hex
    });
  };
  const colorPopupRef = useRef<HTMLDivElement>(null);

  // colorPopup 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!colorPopupRef.current) return;

      const isOutside = !colorPopupRef.current.contains(target);
      if (isOutside) {
        // stop: 현재 팝업만 닫기
        e.stopPropagation();
        e.stopImmediatePropagation();
        setIsColorPopupOpen(false)
      };
    };

    // 팝업이 열려 있을 때만 이벤트 등록
    if (isColorPopupOpen) {
      document.addEventListener('click', handleClickOutside, true);
    }
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [isColorPopupOpen]);

 // rename
  useEffect(() => {
    if (isRename && renameRef.current) {
      renameRef.current.focus();
    }
  }, [isRename]);

  // fold 상태 변경 시 redux에 업데이트
  const handleIsFolded = () => {
    setIsFolded(prev => !prev);
    dispatch(setIsFoldedState({
      type: 'folder',
      folderId: folder.id,
      isFolded: !isFolded
    }));
  }
  
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
      renameRef.current.value = folderName; // 원복
    }
  }
  
  // 이름 변경
  const handleBlur = async () => {
    if (renameRef.current) {
      const newName = renameRef.current.value;
      try {
        // DB 변경
        await updateListName({
          id: folder.id,
          newName: newName,
          type: 'folder'
        });
        // redux 변경 (화면 자동반영)
        dispatch(setNameState({
          id: folder.id,
          newName: newName,
          type: 'folder'
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
    if (!container || !items) return;

    const registerDropTarget = async () => {
      return dropTargetForElements({
        element: container,
        canDrop({ source }) {
          return source.data && "itemId" in source.data;
        },
        onDrop: async ({ source, location }) => {
          const sourceData = source.data;
          if (!sourceData || !("itemId" in sourceData)) return;
  
          //const target = location.current.dropTargets[0];
          const target = location.current.dropTargets.find(t => 'folderId' in t.data || 'itemId' in t.data);

          if (!target) return;
          const targetData = target.data;

          console.log(`target:`, target);
          console.log(`source:`, source);
          console.log(`s: ${sourceData.parentId}, t: ${targetData.parentId}`);

          // 같은 폴더로의 이동 처리 X (target: project, source: folder인 경우) 
          if ("folderId" in targetData && "itemId" in sourceData && targetData.folderId === sourceData.parentId) return;

          // 유효하지 않은 target
          if (!targetData || !("folderId" in targetData || "itemId" in targetData)) return;

          let updateOrder = 0;

          // case 1 : item to item 드래그
          if ("itemId" in targetData) {
            const targetOrder = Number(targetData.order);
            const closestEdge = extractClosestEdge(targetData);
            updateOrder = closestEdge === "top" ? targetOrder : targetOrder + 1;
          } 
          // case 2 : item to folder 드래그
          if ("folderId" in targetData) {
            const maxOrder = Math.max(...items.map(item => item.order), -1) ;
            updateOrder = maxOrder + 1;
          }

          // 동일 폴더에서의 이동 && 후순위로의 이동은 updateOrder -1
          if (
            (("itemId" in targetData && targetData.parentId == sourceData.parentId)
              || ("folderId" in targetData && targetData.folderId == sourceData.parentId)
            ) && updateOrder > Number(sourceData.order)) {
            updateOrder -= 1;
          }

          // redux 반영
          dispatch(moveItem({
            sourceParentId: Number(sourceData.parentId),
            targetParentId: folder.id,
            sourceId: Number(sourceData.itemId),
            updateOrder: Number(updateOrder)
          }));

          // // DB 변경
          moveList({
            type: 'item',
            id: Number(sourceData.itemId),
            originalParentId: Number(sourceData.parentId),
            updateParentId: folder.id,
            originalOrder: Number(sourceData.order),
            updateOrder: updateOrder
          });

          // 이동 후 flash
          const element :Element | null = document.querySelector(`[data-folder-wrapper="${sourceData.itemId}"]`);
          if (element instanceof Element) {
            setTimeout(() => {
              flash(element);
            }, 10)
          }
        },
      });
    };
    registerDropTarget();
  }, [items]);

  return (
    <div ref={containerRef}>
      <div
        className={`group folder flex items-center p-[2px] pl-4 cursor-default rounded-[5px] h-[30px] hover:bg-[#ecedf1] has-[.popup-menu]:bg-[#ecedf1] ${dragStateType === "dragging-folder-over" ? "bg-blue-100/70" : ""}`}>
        {/* 폴더 아이콘 */}
        <button type="button" className="w-[23px] h-[23px] p-[1.8px] hover:bg-[#d7dadf] transition-all cursor-pointer mr-[6px] rounded-[4px]" onClick={toggleColorPopup}>
          {isFolded ? 
          <svg style={{color: `${folder.iconColor}`}} className="relative left-[1px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={folder.iconColor === "000000" ? "none" : "currentColor"} fillOpacity="0.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2"></path>
          </svg> :
          <svg style={{color: `${folder.iconColor}`}} className="relative left-[1px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={folder.iconColor === "000000" ? "none" : "currentColor"} fillOpacity="0.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M5 19l2.757 -7.351a1 1 0 0 1 .936 -.649h12.307a1 1 0 0 1 .986 1.164l-.996 5.211a2 2 0 0 1 -1.964 1.625h-14.026a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v2"></path>
          </svg>}
        </button>
        {isColorPopupOpen &&
        <ColorPicker
          hex={folder.iconColor}
          colorPopupRef={colorPopupRef}
          setIsColorPopupOpen={setIsColorPopupOpen}
          applyColor={applyColor}
        />}
        {/* 폴더 이름 */}
        { isRename ? ( /* 이름변경 시 */
          <div className="flex-1 rename peer">
            <input
              type="text"
              className="w-full px-[6px] py-[0px] outline-solid outline-gray-400 outline-1 rounded-[3px] bg-white"
              defaultValue={folderName}
              onBlur={handleBlur}
              ref={renameRef}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck="false"
              maxLength={50}
            />
          </div>
        ) : (
          // width를 지정해야 hover 시 overflow가 발생하지 않음
          <span className="relative top-[1px] cursor-pointer w-[10px] flex-1 truncate" onClick={handleIsFolded}>{folderName}</span>
        )
      }
      {/* button wrapper */}
      <div className="p-[3px] ml-auto items-center hidden group-hover:flex has-[.popup-menu]:flex">
        {/* button - add */}
        <SidebarAddButton addType="item" item={folder} />
        {/* button - setting */}
        <SidebarSettingButton type="folder" handleRename={handleRename} item={folder} />
      </div>
    </div>
    {
      /* 하위 Item List */
      !isFolded && <div className="relative">
        {
          [...(items ?? [])].sort((a, b) => (a.order) - (b.order)).map((item) => (
            <DraggableItem key={item.id} item={item} project={project} folder={folder} />
          ))
        }
      </div>
    }
    </div>
  );
}