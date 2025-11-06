'use client'
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/store/store"
import { MouseEvent, useEffect, useRef, useState } from "react";
import ColorPanel from "../../colorPanel";
import { showModal } from "../../modalUtils";
import { useToast } from "@/app/context/ToastContext";
import { deleteTag, editTag } from "@/app/store/tableSlice";
import { deleteTagFromDB, editTagFromDB } from "@/app/controllers/taskController";

export default function EditTagPopup({
  tagPopupRef,
  setIsTagPopupOpen,
  style,
  tag
}: {
  tagPopupRef: React.RefObject<HTMLDivElement | null>,
  setIsTagPopupOpen: (arg: boolean) => void,
  style: { top: number, left: number },
  tag: RowTag
}) {
  const dispatch: AppDispatch = useDispatch();
  const {showToast} = useToast();

  // input에 자동 포커스
  useEffect(() => {
    tagNameInputRef.current?.focus();
  }, []);

  // 태그 name input
  const tagNameInputRef = useRef<HTMLInputElement>(null);

  // tag popup 외부 클릭 시 팝업 종료
  const handleClickOutside = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsTagPopupOpen(false);
  };
  const [selectedHex, setSelectedHex] = useState(tag.color);
  const defaultColors = [
    '000000','ff0000','ff7800','f7d92b','008000','0050ff','000080','800080','a52A2a', '505050', '808080', 'b5bcc2', 'ffc0cb','ff69b4','3dce72','2cbdd3','87ceeb',
  ];

  // tag 삭제
  const handleDeleteTag = () => {
    // state 업데이트
    dispatch(deleteTag({tagId: tag.id}))

    // DB 업데이트
    deleteTagFromDB({tagId: tag.id});
  }

  // 수정 적용
  const handleEditTag = () => {
    const name = tagNameInputRef?.current?.value.trim();
    if (!name) {
      showToast('이름을 입력해주세요.', 'error');
      tagNameInputRef.current!.focus()
      return;
    }

    // state 업데이트
    dispatch(editTag({
      tagId: tag.id,
      color: selectedHex,
      name
    }))

    // DB 업데이트
    editTagFromDB({
      tagId: tag.id,
      color: selectedHex,
      name
    });

    setIsTagPopupOpen(false);
  }

  return (
    <div
      className="fixed z-100 h-full w-full top-0 left-0"
      onClick={(e) => handleClickOutside(e)}
    >
      <div
        className="absolute bg-white rounded-[6px] shadow-[var(--popupShadow)] cursor-default z-100 popup-menu w-[230px] w-[250px] top-[30px]"
        style={style}
        onClick={(e) => e.stopPropagation()}
        ref={tagPopupRef}
      >
        {/* name input */}
        <div className="p-[5px] py-[8px] border-b-[1px] border-gray-200">
          <input
            ref={tagNameInputRef}
            className="
              w-full border border-gray-300/70 outline-none focus:border-blue-400
              rounded-[3px] text-[14px] text-left px-[5px]
            "
            defaultValue={tag.name}
            autoComplete="off"
            spellCheck="false"
            maxLength={50}
          ></input>
        </div>
        {/* color 수정 */}
        <div className="p-[8px] border-b-[1px] border-gray-200">
          <div className="
            flex items-center border-gray-400/80 border-b-[1px] pt-[5px] pb-[8px] leading-[100%]
          ">
            <div className="relative top-[0px]">
              <ColorPanel hex={selectedHex} selected={true} />
            </div>
            <span className="flex ml-[5px] text-[13px] justify-center items-center text-[#333333] leading-[100%]">
              <span className="font-[600]">#</span>
              <input
                type="text"
                className="inline-block ml-[2px] outline-none text-center text-[13px] text-[#333333] border-[1px] border-[#808080] p-[2px] w-[58px] rounded-[3px] leading-[100%] bg-gray-100/50"
                value={selectedHex}
                onChange={(e) => {
                  // 16진수만 허용
                  const newHex = e.target.value.replace(/[^0-9a-f]/gi, '');
                  setSelectedHex(newHex);
                }}
                autoComplete="off"
                spellCheck="false"
                maxLength={6}
              />
            </span>
            {/* 컬러 직접 선택 */}
            <button type="button" className="flex ml-[6px] rounded-full hover:bg-gray-200/80 p-[2px]">
              <label htmlFor="colorInput">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" strokeWidth="1.5">
                  <path d="M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25"></path>
                  <path d="M8.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                  <path d="M12.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                  <path d="M16.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                </svg>
              </label>
              <input
                id="colorInput"
                type="color"
                className="w-0 h-0"
                onChange={(e) => setSelectedHex(e.target.value.replace(/#/, ''))}
              />
            </button>
          </div>
          <div className="pt-[5px]">
            <ul className="flex gap-[2px] flex-wrap">
              {
                defaultColors.map(c => (
                  <li key={c}>
                    <ColorPanel
                      hex={c}
                      selected={c === selectedHex}
                      onSelect={setSelectedHex}
                    />
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
        {/* 버튼 영역 */}
        <div className="flex items-center justify-end py-[8px] px-[8px]">
          {/* 삭제 버튼 */}
          <button
            type="button"
            className="
              flex items-center transition mr-[5px] hover:bg-red-100/60 cursor-pointer
              p-[2px] pr-[7px] pl-[4px] rounded-[4px] box-content border border-red-300 rounded-[4px]
            "
            onClick={async () => {
              try {
                await showModal({
                  type: 'delete',
                  title: `'${tag.name}' 태그를 삭제하시겠습니까? 모든 행에서 삭제됩니다.`
                });
                handleDeleteTag();
                showToast('삭제되었습니다.', 'success');
                return;
              } catch {
                console.log('사용자 취소');
                return;
              }
            }}
          >
            <svg className="h-[18px] w-[18px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#db0000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7l16 0" />
              <path d="M10 11l0 6" />
              <path d="M14 11l0 6" />
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
            </svg>
            <span className='relative top-[1px] ml-[2px] text-[12px] text-[#db0000]'>Delete</span>
          </button>
          {/* 적용 버튼 */}
          <button
            type="button"
            className="
              flex items-center transition hover:bg-blue-600/90 cursor-pointer
              p-[2px] pr-[7px] pl-[4px] rounded-[4px] box-content bg-blue-500 border border-blue-500 rounded-[4px]
            "
            onClick={handleEditTag}
          >
            <svg className='relative mr-[3px] top-[1px] left-[1px] w-[14px] h-[14px] text-[#fff]' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <path d="M18 6v6a3 3 0 0 1 -3 3h-10l4 -4m0 8l-4 -4"></path>
              </svg>
            <span className='relative top-[1px] ml-[2px] text-[12px] text-[#fff]'>Apply</span>
          </button>
        </div>
      </div>
    </div>
  )
}