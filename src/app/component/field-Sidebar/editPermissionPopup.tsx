'use client'
import { useEffect, useRef, useState } from "react";
import OrgTree from "../orgTree";
import { useToast } from "@/app/context/ToastContext";
import { getPemissionsFromDB, savePermissionToDB } from "@/app/controllers/taskController";
import { searchUserOrDepartmentByNameFromDB } from "@/app/controllers/userController";
import { Spin } from "antd";
import { OrgTreeNode } from "@/global";

export default function EditPermissionPopup(
  {
    setIsPopupOpen,
    field,
    newName,
    setPermittedList,
    permittedList
  }: {
    setIsPopupOpen: (arg: boolean) => void,
    field?: TaskField, // edit 시에 사용
    newName?: string, // add 시에 사용
    setPermittedList: (arg: OrgTreeNode[]) => void,
    permittedList?: OrgTreeNode[]
  }) {
  // 추가된 users or departments
  const [selectedNodes, setSelectedNodes] = useState<OrgTreeNode[]>([]);
  // 추가 대기 (현재 클릭된 node)
  const [currentNode, setCurrentNode] = useState<OrgTreeNode | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState<OrgTreeNode[]>();
  const { showToast } = useToast();
  const [isAddedListLoading, setIsAddedListLoading] = useState(true);
  const [isSearchResultLoading, setIsSearchResultLoading] = useState(true);

  // selectedNodes 받아오기
  useEffect(() => {
    if (!field?.fieldId && permittedList) {
      // add의 경우
      setSelectedNodes(permittedList);
      setIsAddedListLoading(false);
      return;
    }
    if (!field) return;
    getPemissionsFromDB({
      type: 'field',
      id: field?.typeId
    }).then((res) => {
      setSelectedNodes([
        ...(res.departments as OrgTreeNode[]),
        ...(res.users as OrgTreeNode[])
      ]);
      setIsAddedListLoading(false);
    })
    
  }, [])

  // permission 추가
  const handleAddPermission = () => {
    const type = currentNode?.type;
    const id = currentNode?.id;
    const title = currentNode?.title || '';
    if (!type || !id) {
      showToast('오류가 발생했습니다.', 'error');
      return;
    }

    // 중복 검사
    const isDuplicate = selectedNodes.some(
      node => node.type === type && node.id === id
    );

    if (isDuplicate) {
      showToast('이미 등록된 항목입니다.', 'error');
      return;
    }
    
    const newNodes = structuredClone(selectedNodes) || [];
    newNodes.push({type, id, title});
    setSelectedNodes(newNodes);
  }

  // permission 삭제
  const handleDeletePermission = ({
    type, id
  }: {
    type: string,
    id: string
  }) => {
    const newNodes = selectedNodes.filter((node) => (
      !(node.id === id && node.type === type)
    ));
    setSelectedNodes(newNodes);
  }

  // 검색 처리
  const handleSearchByName = () => {
    const keyword = searchKeywordRef.current?.value.trim();
    if (!keyword) {
      showToast('검색어를 입력해주세요.', 'error');
      return;
    }

    setIsSearchResultLoading(true);
    // 초기화
    const newResults: OrgTreeNode[] = [];
    setSearchResults([]);
    setIsSearchMode(true); // 검색모드 전환

    // DB에서 조회
    searchUserOrDepartmentByNameFromDB({
      searchKeyword: keyword
    }).then((res) => {
      res.users.forEach((user) => {
        newResults.push({
          type: 'user',
          id: user.USER_ID,
          title: user.USER_NAME || ''
        })
      })

      res.departments.forEach((dept) => {
        newResults.push({
          type: 'department',
          id: dept.DEPT_CODE,
          title: dept.DEPT_NAME || ''
        })
      })

      setSearchResults(newResults);
      setCurrentNode(null);
      setIsSearchResultLoading(false);
    })
  }

  // 검색 input ref
  const searchKeywordRef = useRef<HTMLInputElement>(null);

  // 저장
  const handleSavePermission = async () => {
    setPermittedList(selectedNodes);
    setIsPopupOpen(false);
    /*
    if (!field?.fieldId) {
      showToast('오류가 발생했습니다.', 'error');
      return;
    }

    try {
      const result = await savePermissionToDB({
        resourceType: 'field',
        resourceId: field.fieldId,
        permissions: selectedNodes
      });

      if (result.result === 'success') {
        showToast('저장되었습니다.', 'success');
        setIsPopupOpen(false);
        
      } else {
        // 상세한 에러 메시지 표시
        const errorMessage = result.message || '권한 저장 중 오류가 발생했습니다.';
        showToast(errorMessage, 'error');
      }
    } catch (error) {
      // 에러 처리
      console.error('Unexpected error in handleSavePermission:', error);
      showToast('오류가 발생했습니다.', 'error');
    } */
  };
  return (
    <div className="absolute h-full w-full top-[0px] left-[0px] z-3"
      onClick={(e) => {
        e.stopPropagation(); // fieldSlide 닫힘 방지
      }}> 
      <div className="h-full w-full bg-gray-300 opacity-[50%] top-[0x] left-[0px]">
        {/* 반투명 배경 */}
      </div>
      <div className="absolute top-[30%] left-[50%] translate-x-[-50%] translate-y-[-30%] text-[14px]">
        <div
          className='bg-white px-[25px] pt-[20px] pb-[10px] rounded-[6px] shadow-[var(--popupShadow)] cursor-default z-3'
        >
          {/* close button */}
          <button
            type="button" className="absolute right-[7px] top-[8px] hover:bg-[#ecedf1] rounded-[4px] p-[2px] cursor-pointer" onClick={() => setIsPopupOpen(false)}>
            <svg
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#555" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" strokeWidth="2">
              <path d="M18 6l-12 12"></path>
              <path d="M6 6l12 12"></path>
            </svg>
          </button>
          <div className="flex items-center mb-[5px]">
            <div>
              <h2 className="font-[500] text-[15px]">Edit Permission</h2>
            </div>
          </div>
          <div className="flex flex-col">
            {/* 그룹명 */}
            <div className="flex items-center border border-gray-300 mb-[7px] rounded-[5px]" style={{boxShadow: '1px 1px 2px rgb(0 0 0 / 10%)'}}>
              <div className="py-[3px] px-[12px] border-r border-gray-300  text-[13px] font-[500] rounded-l-[5px] bg-[#ecf6ff]">Field Name</div>
              <div className="p-[3px] ml-[3px] font-[500]">
                {field?.name || newName || ''}
              </div>
            </div>
            <div className="flex">
              {/* 검색 */}
              <div className="border border-gray-300 w-[260px] rounded-[5px]" style={{boxShadow: '1px 1px 2px rgb(0 0 0 / 10%)'}}>
                <div className="border-b border-gray-300 py-[4px] px-[10px] text-[13px] font-[500] rounded-t-[5px] bg-[#ecf6ff]">
                  <h3>Search</h3>
                </div>
                <div className="border-b border-gray-300">
                  <div className="flex px-[5px] py-[6px]">
                    <input type="text" ref={searchKeywordRef}
                      autoComplete="off" spellCheck="false" maxLength={10}
                      className="outline-none border border-gray-400/89 w-full py-[1px] px-[4px] rounded-[2px]
                      transition focus:border-blue-400 hover:border-blue-300"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearchByName();
                      }}
                    />
                    <button
                      type="button"
                      className="ml-[3px] hover:bg-gray-200/80 px-[4.5px] cursor-pointer rounded-[3px] transition border border-gray-300 bg-gray-100/90"
                      onClick={handleSearchByName}
                    >
                      <svg
                        className="h-[14px] w-[14px] top-[0.5px] relative"
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
                </div>
                <div className="mt-[3px] mb-[4px] ml-[3px]">
                  {/* Add button */}
                  <button type="button" className="flex items-center justify-center pl-[8px] pr-[12px] py-[2px] text-[12px] rounded-[5px] cursor-pointer bg-blue-500/90 text-white font-[300] hover:bg-blue-500 transition"
                    onClick={handleAddPermission}
                  >
                    <div className="w-[14px] h-[14px] mr-[1px]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"                      
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 5l0 14" />
                        <path d="M5 12l14 0" />
                      </svg>
                    </div>
                    <span className="relative top-[0.7px]">Add</span>
                  </button>
                </div>
                <div className="flex flex-col h-[420px] overflow-auto scroll-8px">
                  {
                    isSearchMode ? 
                    /* 검색결과 mode */
                    <>
                    <div className="flex items-center px-[7px] py-[1px] bg-gray-100/30 border-b border-t border-[#bbbaaa] text-[13px] font-[500]">
                      <p>검색결과: {searchResults?.length} 건</p>
                      <button
                        type="button" className="ml-auto p-[4px] rounded-[4px] hover:bg-red-100/80 transition"
                        onClick={() => setIsSearchMode(false)}
                      >
                        <div className="h-[10px] w-[10px] text-gray-500/85">
                          <svg
                            xmlns="http://www.w3.org/2000/svg" viewBox="6 6 12 12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                            <path d="M18 6l-12 12"></path>
                            <path d="M6 6l12 12"></path>
                          </svg>
                        </div>
                      </button>
                    </div>
                    <ul className="h-full">
                      {
                        isSearchResultLoading ?
                          <div className="flex items-center justify-center h-full">
                            <Spin></Spin>
                          </div>
                        : searchResults?.length ? (
                          // 결과가 있는 경우
                          searchResults
                            .sort((a, b) => {
                              // department 우선 표시
                              if (a.type === 'department' && b.type === 'user') return -1;
                              if (a.type === 'user' && b.type === 'department') return 1;
                              return 0;
                            })
                            .map((result, i) => {
                              // 검색결과 - department
                              return (
                                <li key={i} data-id={result.id}
                                  className={`group flex items-center py-[2px] px-[4px] whitespace-nowrap transition
                                  ${(currentNode?.id === result.id && currentNode.type === result.type)
                                    ? 'bg-blue-100/90 hover:bg-blue-200/80'
                                    : 'hover:bg-gray-100'
                                  }
                                  `}
                                  onClick={() => {
                                    setCurrentNode({
                                      type: result.type,
                                      id: result.id,
                                      title: result.title
                                    })
                                  }}
                                >
                                  <div className="mr-[5px] relative top-[-1px]">
                                    {
                                      result.type === 'department' ? (
                                        <svg
                                          className="h-[18px] w-[18px]"
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 24 24"
                                          fill="#ffe1aa"
                                          stroke="#ffa600"
                                          strokeWidth="1"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
                                        </svg>
                                      ): (
                                        <svg
                                          className="h-[18px] w-[18px] text-blue-300 relative"
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 24 24"
                                          fill="currentColor"
                                          stroke="#2b7fff"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                                          <path d="M6 20v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                                        </svg>
                                      )
                                    }
                                    
                                  </div>
                                  <p className="truncate">{result.title}</p>
                                </li>
                              )
                            })
                        ): (
                        <li className="text-center">검색 결과가 없습니다.</li>
                        )
                      }
                    </ul></> :
                    /* 조직도 mode */
                    <OrgTree onNodeSelect={setCurrentNode}></OrgTree>
                  }    
                </div>
              </div>
              {/* arrow */}
              <div className="flex justify-center items-center w-[20px]">
                <svg
                  className="text-blue-500/80 h-[24px] w-[24px]"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="6 0 12 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 6l6 6l-6 6" />
                </svg>
              </div>
              {/* 선택 영역 (added users / department) */}
              <div className="border border-gray-300 w-[300px] rounded-[5px]" style={{boxShadow: '1px 1px 2px rgb(0 0 0 / 10%)'}}>
                <div className="border-b border-gray-300 py-[4px] px-[10px] text-[13px] font-[500] rounded-t-[5px] bg-[#ecf6ff]">
                  <h3>Added Users / Departments</h3>
                </div>
                <div className="h-full">
                  <ul className="py-[5px] px-[5px] h-full">
                    {
                      selectedNodes.length ? (
                        selectedNodes
                          .sort((a, b) => {
                              // department 우선 표시
                              if (a.type === 'department' && b.type === 'user') return -1;
                              if (a.type === 'user' && b.type === 'department') return 1;
                              return 0;
                            })
                          .map((node, i) => {
                            return (
                              <li key={i} data-id={node.id}
                                className="group flex items-center py-[2px] px-[4px] whitespace-nowrap hover:bg-blue-100/90 transition"
                              >
                                <div className="mr-[5px]">
                                  {
                                    node.type === 'department' ? (
                                      <svg
                                        className="h-[18px] w-[18px]"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="#ffe1aa"
                                        stroke="#ffa600"
                                        strokeWidth="1"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
                                      </svg>
                                    ): (
                                      <svg
                                        className="h-[18px] w-[18px] text-blue-300 relative"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        stroke="#2b7fff"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                                        <path d="M6 20v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                                      </svg>
                                    )
                                  }

                                </div>
                                <p className="truncate">{node.title}</p>
                                {/* delete button */}
                                <button type="button"
                                  className="hidden group-hover:flex ml-auto text-red-400 cursor-pointer p-[3px] rounded-[3px] hover:bg-red-100 transition"
                                  onClick={() => {
                                    handleDeletePermission({
                                      type: node.type,
                                      id: node.id
                                    })
                                  }}
                                >
                                  <div className="h-[11px] w-[11px]">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg" viewBox="6 6 12 12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                                      <path d="M18 6l-12 12"></path>
                                      <path d="M6 6l12 12"></path>
                                    </svg>
                                  </div>
                                </button>
                              </li>
                            )
                        })
                      ): (
                        isAddedListLoading ?
                          <div className="flex items-center justify-center h-full">
                            <Spin></Spin>
                          </div>
                          : <li className="text-center">등록된 사용자/부서가 없습니다.</li>
                      )             
                    }
                  </ul>
                </div>
              </div>
            </div>
            {/* 검색 영역 */}
          </div>
          <div className="flex">
            <div className="flex mt-[8px] ml-auto">
              <button type="button"
                className="bg-blue-500/90 hover:bg-blue-500 transition text-[13px] text-white px-[12px] py-[2px] rounded-[3px] cursor-pointer mr-[5px]"
                onClick={handleSavePermission}>저장</button>
              <button type="button"
                className="bg-gray-300/80 hover:bg-gray-300/95 transition text-[13px] text-gray-700 font-[500] px-[12px] py-[2px] rounded-[3px] cursor-pointer"
                onClick={() => {
                  setIsPopupOpen(false);
              }}>취소</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}