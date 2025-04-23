import { useState, useRef, useEffect } from 'react';
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store/store";
import { useDispatch } from "react-redux";
import { addListItem } from "@/app/controllers/projectController";
import ColorPicker from './colorPicker'
import { addItem } from "@/app/store/projectsSlice";

interface SidebarAddPopupProps {
  popupRef: React.RefObject<HTMLDivElement | null>;
  addType: ListType;
  setIsPopupOpen: (isPopupOpen: boolean) => void;
  parentId: number;
}

const typeName = {
  project: "프로젝트",
  folder: "폴더",
  item: "항목"
}

export default function SidebarAddPopup({popupRef, addType, setIsPopupOpen, parentId} : SidebarAddPopupProps) {
  const dispatch = useDispatch();
  const [iconColor, setIconColor] = useState("000000");
  const [isColorPopupOpen, setIsColorPopupOpen] = useState(false);
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
  const locationSelectRef = useRef<HTMLSelectElement>(null);
  
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
  const validateInput = () => {
    if (!nameInputRef.current?.value.trim()) {
      alert("이름을 입력하세요.");
      return false;
    }
    if (locationSelectRef.current && !locationSelectRef.current?.value) {
      alert("위치를 선택하세요.");
      return false;
    }

    // DB에 추가
    addListItem({
      type: addType,
      name: nameInputRef.current?.value,
      iconColor: iconColor,
      ...(addType !== "project"
        ? {parentId: Number(locationSelectRef.current?.value) || 0}
        : {})
    }).then((newListItem) => {
      // redux store에 추가
      dispatch(addItem({
        id: Number(newListItem.ID),
        addType: addType,
        name: newListItem.NAME,
        order: Number(newListItem.ORDER),
        iconColor: newListItem.ICON_COLOR,
        ...(addType !== "project"
          ? {parentId: Number(newListItem.PARENT_ID) || 0}
          : {})
      }))

      setIsPopupOpen(false);
    }).catch((error) => {
      console.error("Failed to add list item:", error);
    });

    setIsPopupOpen(false);
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
      { addType !== "project" &&
      <div className='mt-[8px]'>
        <div className='text-[13px] font-semibold mb-[1px]'>Location</div>
        <select
          className='border-[1px] rounded-[3px] border-gray-400 min-w-full h-[23px] focus:border-blue-400 focus-visible:outline-none'
          defaultValue={parentId}
          key={parentId}
          ref={locationSelectRef}
        >
          {
            addType === "folder" &&
            projectList.map((p) => (
              <option key={p.id} value={p.id} className='text-[13px]'>
                {p.name}
              </option>
            ))
          }
          {
            addType === "item" &&
            projectList.flatMap((p) => (
              p.lists?.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))
            ))
          }
        </select>
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
          onClick={validateInput}
        >추가</button>
      </div>
    </div>
  );
}