import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store/store";
import { useDispatch } from "react-redux";
import { addItemToDB } from "@/app/controllers/projectController";
import ColorPicker from '../colorPicker'
import { addItemToStore } from "@/app/store/projectsSlice";
import { showModal } from '@/app/component/modalUtils';

interface SidebarAddPopupProps {
  popupRef: React.RefObject<HTMLDivElement | null>;
  addType: ListType;
  setIsPopupOpen: (isPopupOpen: boolean) => void;
  item: List | null;
}

const typeName = {
  project: "프로젝트",
  folder: "폴더",
  item: "항목"
}

export default function SidebarAddPopup({popupRef, addType, setIsPopupOpen, item} : SidebarAddPopupProps) {
  const dispatch = useDispatch();
  const [iconColor, setIconColor] = useState("000000");
  const [isColorPopupOpen, setIsColorPopupOpen] = useState(false);
  // addType === item 일때 folder options 표시 목적
  const [selectedProjectId, setSelectedProjectId] = useState(item?.parentId)

 const selectParentProject = (e:ChangeEvent<HTMLSelectElement>) => {
  if (addType !== "item") return;
  setSelectedProjectId(Number(e.target.value))
 }

  // colorPicker ref
  const colorPopupRef = useRef<HTMLDivElement>(null);
  const toggleColorPopup = () => {
    setIsColorPopupOpen(prev => !prev);
  }
  const applyColor = (hex: string) => {
    setIsColorPopupOpen(false);
    setIconColor(hex);
  };
  const projectList = useSelector((state: RootState) =>
    state.projects.projects
  ) as List[];

  // input List
  const nameInputRef = useRef<HTMLInputElement>(null);
  const projectSelectRef = useRef<HTMLSelectElement>(null);
  const folderSelectRef = useRef<HTMLSelectElement>(null);
  
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

  // 등록 전 유휴성 검사
  const addItem = async () => {
    if (!nameInputRef.current?.value.trim()) {
      try {
        await showModal({
          type: 'alert',
          title: `이름을 입력하세요.`,
        });
      } catch {
        console.log('error');
      }
      return false;
    }

    // DB에 추가
    addItemToDB({
      type: addType,
      name: nameInputRef.current?.value,
      iconColor: iconColor,
      ...(addType === "folder"
        ? {parentId: Number(projectSelectRef.current?.value)}
        : (
          addType === "item"
          ? {parentId: Number(folderSelectRef.current?.value)}
          : {}
        ))
    }).then((newItem) => {
      // redux store에 추가
      dispatch(addItemToStore({
        id: Number(newItem.ID),
        addType: addType,
        name: newItem.NAME,
        order: Number(newItem.ORDER),
        iconColor: newItem.ICON_COLOR,
        ...(addType !== "project"
          ? {parentId: Number(newItem.PARENT_ID) || 0}
          : {})
      }))

      setIsPopupOpen(false);
    }).catch((error) => {
      console.error("Failed to add list item:", error);
    });

    setIsPopupOpen(false);
  }

  // select 기본 값 구하기
  let parentProjectId = 0;
  let parentFolderId = 0;
  
  if (addType === "folder") {
    parentProjectId = Number(item?.id);
  }
  if (addType === "item") {
    parentFolderId = Number(item?.id);
    parentProjectId = Number(item?.parentId);
  }
  return (
    <div
      className="absolute bg-white p-[10px] pl-[18px] pr-[18px] rounded-[6px] shadow-[var(--popupShadow)] cursor-default z-3 popup-menu w-[230px] pb-[10px]"
      ref={popupRef}
      onClick={(e) => e.stopPropagation()}
    >
      <div className='relative'>
        <h2 className="text-center font-semibold">{`${typeName[addType]} 추가`}</h2>
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
      {/* name */}
      <div className='mt-[8px]'>
        <div className='text-[13px] font-semibold mb-[1px]'>Name</div>
        <input
          type="text"
          className='w-full bg-white px-[6px] py-[0px] border-solid border-gray-400 border-1 rounded-[3px] focus:border-blue-400 outline-none'
          ref={nameInputRef}
        />
      </div>
      {/* location */}
      { ["folder", "item"].includes(addType) &&
      <div className='mt-[8px]'>
        <div className='text-[13px] font-semibold mb-[1px]'>Location</div>
        {/* project list */}
        <select
          className='border-[1px] rounded-[3px] border-gray-400 w-full h-[23px] focus:border-blue-400 focus-visible:outline-none text-[13px]'
          defaultValue={parentProjectId}
          key={`p${parentProjectId}`}
          ref={projectSelectRef}
          onChange={selectParentProject}
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
        addType === "item" &&
        <select
          className='border-[1px] rounded-[3px] border-gray-400 min-w-full h-[23px] focus:border-blue-400 focus-visible:outline-none text-[13px] mt-[5px]'
          defaultValue={parentFolderId}
          key={`f${parentFolderId}`}
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
      {/* color */}
      <div className='mt-[10px]'>
        <div className='text-[13px] font-semibold mb-[1px]'>Color</div>
        <div className='flex relative mt-[3px]'>
          {/* color 미리보기 */}
          <div className='inline-block rounded-full w-[22px] h-[22px] border-[1px] border-[#3c7fff] p-[3px]'>
            <span
              className='block rounded-full w-full h-full'
              data-color={iconColor}
              style={{backgroundColor: `#${iconColor}`}}
            ></span>
          </div>
          {/* color Edit button */}
          <button
            className='relative flex icon-color-selector ml-[10px] mt-[1px] border-gray-400 border-[1px] hover:border-[#777777] rounded-[3px] p-[1px] pl-[5px] pr-[7px] text-[#555] hover:text-[#195eff] font-[500] text-[12px] transition-all top-[-1px]'
            onClick={toggleColorPopup}
          >
            <span className='relative top-[1.5px]'>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="14.5" height="14.5" strokeWidth="2">
                <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"></path>
                <path d="M13.5 6.5l4 4"></path>
              </svg>
            </span>
            <span className='ml-[2px]'>Edit</span>
          </button>
          {isColorPopupOpen &&
            <ColorPicker
              hex={iconColor}
              colorPopupRef={colorPopupRef}
              setIsColorPopupOpen={setIsColorPopupOpen}
              applyColor={applyColor}
            />}
        </div>
      </div>
      <div className='flex mt-[5px]'>
        <button
          className='dft-apply-btn ml-auto pt-[4px] pb-[4px] pl-[10px] pr-[10px]'
          onClick={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            addItem();
          }}
        >추가</button>
      </div>
    </div>
  );
}