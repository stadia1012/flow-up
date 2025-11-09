'use client'
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/store/store";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { addAllTags, addTagToRow, deleteRowTag, setRealId } from "@/app/store/tableSlice";
import { addTagToRowFromDB, createTagToDB, deleteRowTagFromDB } from "@/app/controllers/taskController";
import EditTagButton from "./editTagButton";

export default function AddTagPopup({
  rowId,
  allTags,
  tagIds,
  tagPopupRef,
  setIsTagPopupOpen,
  setShowActions,
  style,
}: {
  rowId: number,
  allTags: RowTag[],
  tagIds: number[],
  tagPopupRef: React.RefObject<HTMLDivElement | null>,
  setIsTagPopupOpen: (arg: boolean) => void,
  setShowActions: (arg: boolean) => void,
  style: { top: number, left: number }
}) {
  const dispatch: AppDispatch = useDispatch();

  // tag popup 외부 클릭 시 팝업 종료
  const handleClickOutside = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsTagPopupOpen(false);
    setShowActions(false);
  };

  // input에 자동 포커스
  useEffect(() => {
    tagInputRef.current?.focus();
  }, []);

  // Searched tags
  const [searchedTagIds, setSearchedTagIds] = useState<number[]>([]);
  // 태그 검색 input
  const tagInputRef = useRef<HTMLInputElement>(null);

  // input 입력 시
  const inputHandler = () => {
    const inputText = tagInputRef.current?.value.trim() || '';

    // 검색된 tags
    const searched = allTags?.filter((t) => (
      t.name.includes(inputText) && !tagIds.includes(t.id)
    )).map(t => t.id);
    setSearchedTagIds(searched);
  }

  // 배경색에 따른 option 글자색 변경 (hexColor: #을 제외한 hex 값)
  const getTextColor = (hexColor: string) => {
    const rgb = parseInt(hexColor, 16) // 10진수 변환
    const r = (rgb >> 16) & 0xff
    const g = (rgb >>  8) & 0xff
    const b = (rgb >>  0) & 0xff
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b // per ITU-R BT.709
    // 색상 선택
    return luma < 170 ? "ffffff" : "171717"
  }

  /* 신규 tag 추가 */
  const createTag = () => {
    const name = tagInputRef.current?.value.trim() || 'unknown';
    const tempId = Date.now()
    // state 업데이트 (임시 id)
    dispatch(addAllTags({
      name,
      tempId
    }));

    // DB 업데이트
    createTagToDB({
      name: name,
      color: 'cccccc'
    }).then((res) => {
      dispatch(setRealId({type: 'tag', tempId, realId: res.ID}));

      /* row에 tag 추가 */
      handleAddTag({tagId: res.ID})
    });

    // input 값 삭제
    if (tagInputRef.current) {
      tagInputRef.current.value = '';
    }
  }

  /* row에 tag 추가 */
  const handleAddTag = ({tagId}: {tagId: number}) => {
    // state 업데이트
    dispatch(addTagToRow({rowId, tagId}))

    // DB 업데이트
    addTagToRowFromDB({rowId, tagId});
  }

  /* row에서 tag 삭제 */
  const handleDeleteTag = ({tagId}: {tagId: number}) => {
    // state 업데이트
    dispatch(deleteRowTag({rowId, tagId}))

    // DB 업데이트
    deleteRowTagFromDB({rowId, tagId});
  }

  return (
    <div
      className="fixed z-100 h-full w-full top-0 left-0"
      onClick={(e) => handleClickOutside(e)}
    >
      <div
        className="absolute bg-white rounded-[6px] shadow-[var(--popupShadow)] cursor-default z-100 popup-menu w-[250px] top-[30px]"
        style={style}
        onClick={(e) => e.stopPropagation()}
        ref={tagPopupRef}
      >
        <div className="flex flex-wrap pt-[5px] px-[10px] w-full max-h-[80px] overflow-y-auto scroll-8px">
          {/* 기존 태그 표시 */}
          {
            tagIds.map((id) => {
              const tag = allTags.find((t) => t.id === id);
              if (!tag) return null;

              return (
                <div key={tag.id} className="flex relative justify-center group my-[3px] mr-[3px] cursor-pointer transition">
                  {/* 삭제 버튼 */}
                  <div
                    className="absolute opacity-[0] group-hover:opacity-[1] w-[16px] h-[16px] rounded-[3px] transition right-[4px] top-[1px] hover:[&>svg]:stroke-[2]"
                    style={{
                      backgroundColor: `#${tag.color}`,
                      color: `#${getTextColor(tag.color)}`
                    }}
                    onClick={() => handleDeleteTag({tagId: tag.id})}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"><path d="M18 6l-12 12"></path><path d="M6 6l12 12"></path></svg>
                  </div>
                  {/* 수정 버튼 */}
                  <div
                    className="absolute opacity-[0] group-hover:opacity-[1] w-[20px] h-[16px] rounded-[4px] transition right-[18px] top-[1px] px-[3px] hover:[&>svg]:stroke-[2.5]"
                    style={{
                      backgroundColor: `#${tag.color}`,
                      color: `#${getTextColor(tag.color)}`
                    }}
                  >
                    <EditTagButton tag={tag}></EditTagButton>
                  </div>
                  {/* tag body */}
                  <div
                    className="inline-block text-[13px] rounded-[4px] text-center min-w-[50px] max-w-[150px] py-[1px px-[3px] truncate"
                    style={{
                      backgroundColor: `#${tag.color}`,
                      color: `#${getTextColor(tag.color)}`
                    }}
                  >{tag.name}</div>
                </div>
              )
            })
          }
        </div>
        <div className="relative px-[13px] py-[8px] border-gray-300/80 border-b-[1px]">
          <input
            ref={tagInputRef}
            type="text"
            className="outline-none text-[14px] text-left"
            placeholder="Search or add tags..."
            autoComplete="off"
            spellCheck="false"
            maxLength={50}
            onInput={inputHandler}
          />
        </div>
        <div className="relative px-[8px] py-[8px] border-gray-300/80 border-b-[1px] h-[200px] overflow-y-auto scroll-8px">
          {
          tagInputRef?.current?.value.trim()
            ? 
              // 검색 입력값이 있는 경우
              searchedTagIds.length
                // 검색 결과가 있으면 표시
                ? searchedTagIds.filter((tagId) => (!tagIds.includes(tagId))).map(tagId => {
                  const tag = allTags.find((t) => t.id === tagId);
                  if (!tag) return null;

                  return <div
                    key={tag.id}
                    className="flex items-center group/tag hover:bg-gray-200/60 transition rounded-[2px] py-[1px] px-[5px] cursor-pointer"
                  >
                    {/* tag body */}
                    <div
                      className="text-[13px] rounded-[4px] text-center min-w-[50px] w-[50px] py-[1px] my-[3px]"
                      style={{
                        backgroundColor: `#${tag.color}`,
                        color: `#${getTextColor(tag.color)}`
                      }}
                      onClick={() => handleAddTag({tagId: tag.id})}
                    >{tag.name}</div>
                    {/* 수정 버튼 */}
                    <div
                      className="ml-auto opacity-[0] group-hover/tag:opacity-[1] w-[20px] h-[16px] rounded-[4px] transition px-[3px] hover:[&>svg]:stroke-[2.5]"
                    >
                      <EditTagButton tag={tag}></EditTagButton>
                    </div>
                  </div>
                })
                // 검색 결과가 없으면 create 표시
                : <div
                    className="flex items-center px-[5px] rounded-[2px] hover:bg-gray-200/60 transition cursor-pointer"
                    onClick={createTag}
                  >
                    <div className="text-[13px]">Create</div>
                    <div
                      className="
                        text-[13px] rounded-[4px] text-center min-w-[50px] max-w-[180px] py-[1px] my-[3px] truncate px-[5px] ml-[5px]
                      "
                      style={{
                        backgroundColor: `#ccc`,
                      }}
                    >{tagInputRef?.current?.value.trim()}</div>
                  </div>
            : 
              // 검색 입력값이 없는 경우
              allTags.length
                ? allTags.filter((tag) => (!tagIds.includes(tag.id))).map(tag => (
                  <div
                    key={tag.id}
                    className="flex items-center group/tag hover:bg-gray-200/60 transition rounded-[2px] py-[1px] px-[5px] cursor-pointer"
                  >
                    {/* tag body */}
                    <div
                      className="inline-block text-[13px] rounded-[4px] text-center min-w-[50px] max-w-[150px] py-[1px] my-[3px] px-[3px] truncate"
                      style={{
                        backgroundColor: `#${tag.color}`,
                        color: `#${getTextColor(tag.color)}`
                      }}
                      onClick={() => handleAddTag({tagId: tag.id})}
                    >{tag.name}</div>
                    {/* 수정 버튼 */}
                    <div
                      className="ml-auto opacity-[0] group-hover/tag:opacity-[1] w-[20px] h-[16px] rounded-[4px] transition px-[3px] hover:[&>svg]:stroke-[2.5]"
                    >
                      <EditTagButton tag={tag}></EditTagButton>
                    </div>
                  </div>
                ))
                : <div className="py-[5px] px-[5px] text-[13px] text-gray-400">No tags created</div>
          }
        </div>
      </div>
    </div>
  );
}