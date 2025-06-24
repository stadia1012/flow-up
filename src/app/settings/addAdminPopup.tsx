'use client'
import { useEffect, useRef, useState } from "react";
import { addUserToAdminListOnDB, searchUserByNameFromDB } from "../controllers/userController";
import { showModal } from "../component/modalUtils";

export default function AddGroupPopup(
  {
    handleAddAdminPopup,
    fetchAdmins
  }:
  {
    handleAddAdminPopup: () => void,
    fetchAdmins: () => void
  }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // 검색 팝업 위치 조정
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const userInputDisplayRef = useRef<HTMLInputElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const keywordInputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const handleSearchPopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSearchOpen && userInputDisplayRef.current) {
      const rect = userInputDisplayRef.current.getBoundingClientRect();
      setPopupPos({
        top: rect.bottom + window.scrollY, // 하단 기준
        left: rect.left + window.scrollX, // 오른쪽 기준
      });
    }
    setIsSearchOpen(prev => !prev);
  };
  const [userSearchResult, setUserSearchResult] = useState<{userId: string; userName: string}[]>([]);

  // user search 자동 포커스
  useEffect(() => {
    if (isSearchOpen && keywordInputRef.current) {
      keywordInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // 외부 클릭 감지 로직
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!popupRef.current) return;

      const isOutside = !popupRef.current.contains(target);

      if (isOutside) setIsSearchOpen(false);
    };

    // 팝업이 열려 있을 때만 이벤트 등록
    if (isSearchOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isSearchOpen]);

  const searchUserByName = () => {
    searchUserByNameFromDB({searchKeyword: keywordInputRef.current?.value || ''})
      .then((res) => {
        setUserSearchResult(res);
    });
  }

  // 검색결과에서 사용자 선택
  const selectUser = ({userId, userName}: {userId: string; userName: string}) => (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('선택할 사용자:', userId, userName);
    if (userInputDisplayRef.current) {
      userInputDisplayRef.current.value = `${userName} (${userId})`;
      setSelectedUserId(userId);
      setIsSearchOpen(false);
    }
  };

  // 관리자 추가
  const addUserToAdminList = async () => {
    if (!userInputDisplayRef.current) return;

    const userId = selectedUserId;
    if (!userId) {
      try {
        await showModal({
          type: 'alert',
          title: '사용자를 선택해주세요.',
          buttonText: {confirm: '확인'}
        });
        return;
      } catch {
        console.log('확인');
      }
      return;
    }

    // 사용자 추가 로직
    addUserToAdminListOnDB({userId}).then( async (res) => {
      if (res.result === 'success') {
        try {
          await showModal({
            type: 'alert',
            title: '사용자 추가가 완료되었습니다.',
          })
        } catch {
          console.log('확인');
          handleAddAdminPopup(); // 팝업 닫기
          fetchAdmins(); // 관리자 목록 새로고침
        }
        return;
      }
      if (res.result === 'duplicate') {
        try {
          await showModal({
            type: 'alert',
            title: '이미 추가된 사용자입니다.',
          })
          return;
        } catch (error) {
          console.log('확인');
        }
        return;
      } else {
        try {
          await showModal({
            type: 'alert',
            title: '오류가 발생했습니다.(1)',
          })
        } catch {
          console.log('확인');
        }
        return;
      }
    });
  }
  return (
    <div className="absolute h-full w-full top-[0px] left-[0px]">
      <div className="h-full w-full bg-gray-300 opacity-[50%] top-[0x] left-[0px]">
        {/* 반투명 배경 */}
      </div>
      <div className="absolute top-[30%] left-[50%] translate-x-[-50%] translate-y-[-30%] text-[14px]">
        {/* 팝업 */}
        <div
          className='bg-white px-[15px] pt-[20px] pb-[10px] rounded-[6px] shadow-[var(--popupShadow)] cursor-default z-3'
        >
          <button
            type="button" className="absolute right-[7px] top-[8px] hover:bg-[#ecedf1] rounded-[4px] p-[2px] cursor-pointer"
            onClick={handleAddAdminPopup}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#555" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" strokeWidth="2">
              <path d="M18 6l-12 12"></path>
              <path d="M6 6l12 12"></path>
            </svg>
          </button>
          <div className="pb-[15px] px-[20px]">
            <h2 className="font-[500] text-[15px] text-center">관리자 추가</h2>
          </div>
          <div className="flex justify-center w-[280px]">
            <div className="flex items-center">
              <input ref={userInputDisplayRef} type="text" className="outline-none border border-gray-400/90 py-[1px] px-[4px] rounded-[2px] transition focus:border-blue-400 hover:border-blue-300 w-[140px]" 
              onClick={(e) => {
                  setUserSearchResult([]);
                  handleSearchPopup(e);
                }} readOnly/>
              <button type="button"
                className="ml-[5px] border border-gray-400 bg-gray-200/85 hover:bg-gray-200 text-[13px] px-[12px] py-[2px] rounded-[3px] cursor-pointer"
                onClick={(e) => {
                  setUserSearchResult([]);
                  handleSearchPopup(e);
                }}
              ><span className="relative top-[1px]">선택</span></button>
            </div>
          </div>
          <div className="flex mt-[25px]">
            <button type="button" className="ml-auto bg-blue-500/90 hover:bg-blue-500 text-[13px] text-white px-[12px] py-[2px] rounded-[3px] cursor-pointer"
            onClick={addUserToAdminList}
            >추가</button>
          </div>
        </div>
      </div>
      { /* 검색 팝업 */
        isSearchOpen && 
        <div
          ref={popupRef}
          className='absolute mt-[4px] border border-gray-300 bg-white py-[6px] px-[6px] rounded-[4px] shadow-[var(--popupShadow)] text-[14px] cursor-default z-3'
          style={{ top: popupPos?.top, left: popupPos?.left }}
        >
          <div className="flex items-center justify-center mb-[8px]">
            <input type="text" placeholder="이름으로 사용자 검색"
              ref={keywordInputRef}
              autoComplete="off" spellCheck="false"
              onKeyDown={(e) => {
                if (e.key === 'Enter') searchUserByName();
              }}
              className="outline-none border border-gray-400/90 w-[170px] py-[1px] px-[4px] rounded-[2px] transition focus:border-blue-400 hover:border-blue-300"
            />
             <button
              type="button"
              className="flex justify-center items-center h-[25px] w-[25px] ml-[3px] hover:bg-gray-200/80 cursor-pointer rounded-[3px] transition border border-gray-400/80 bg-gray-100/90"
              onClick={searchUserByName}
            >
              <svg
                className="h-[14px] w-[14px] relative top-[0.5px]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000000"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                <path d="M21 21l-6 -6" />
              </svg>
            </button>
          </div>
          <div className="h-[150px] overflow-y-auto border-t border-gray-300">
            <ul>
              {/* 검색 결과 목록 */}
              {
                (userSearchResult.length === 0) ? (
                  <li className="text-gray-500 text-center py-[10px]">검색 결과가 없습니다.</li>
                ):
                userSearchResult.map((user) => (
                  <li key={user.userId} className="cursor-pointer px-[12px] py-[5px] hover:bg-gray-100 transition" data-user-id={user.userId} 
                    onClick={selectUser({userId: user.userId, userName: user.userName})}>
                    {`${user.userName} (${user.userId})`}
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
      }
    </div>
  )
}