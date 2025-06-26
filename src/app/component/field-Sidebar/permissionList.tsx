'use client'
import { useEffect, useRef, useState } from "react";
import EditPermissionPopup from "./editPermissionPopup";
import { createPortal } from "react-dom";
import { OrgTreeNode } from "@/global";
import { getPemissionsFromDB, getPermitAllFromDB, updatePermitAllToDB } from "@/app/controllers/taskController";
import { Spin } from "antd";
import { useToast } from "@/app/context/ToastContext";
export default function PermissionList({
    field,
    newName,
    permittedList,
    setPermittedList,
    allowAllRef
  }: {
    field?: TaskField, // edit 시에 사용
    newName?: string, // add 시에 사용
    permittedList: OrgTreeNode[],
    setPermittedList: (arg: OrgTreeNode[]) => void,
    allowAllRef?: React.RefObject<HTMLInputElement | null>,
  }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(() => {
    if (field) { // 수정의 경우 true가 기본값
      return true;
    } else {
      return false;
    }
  });
  // 전체 허용 여부
  const [isPermissionAll, setIsPermissionAll] = useState(false);
  const {showToast} = useToast();

  // 첫 마운트 시 실행
  useEffect(() => {
    if (!field) {
      // add인 경우
      setIsPermissionAll(true);
      return;
    }

    const loadData = async () => {
      if (field) {
        await fetchPermissions();
        await fetchPemitAll();
      }
      setIsLoading(false);
    };
    
    loadData();
  }, [])

  // fetch permission
  const fetchPermissions = async () => {
    if (!field?.typeId) {
      return;
    }
    await getPemissionsFromDB({
      type: 'field',
      id: field?.typeId
    }).then((res) => {
      setPermittedList([
        ...(res.departments as OrgTreeNode[]),
        ...(res.users as OrgTreeNode[])
      ]);
    })
  }

  // 전체 허용 여부 fetch
  const fetchPemitAll = async () => {
    if (field) {
      await getPermitAllFromDB({
        fieldTypeId: field.typeId
      }).then((res) => {
        setIsPermissionAll(res);
      })
    }
  }

  // Allow All Users 체크
  const handlePermitAll = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (field && !field.canEdit) {
      showToast('권한이 없습니다.', 'error');
      return;
    }
    const newStatus = e.target.checked;
    // 화면 업데이트
    setIsPermissionAll(newStatus);
    if (field) {
      // 수정의 경우만 DB 업데이트
      await updatePermitAllToDB({
        status: newStatus,
        fieldTypeId: field.typeId
      });
    }
  }
  
  return (
    <>
      {
        /* loading 표시 */
        isLoading &&
        <div className="flex items-center justify-center h-full min-h-[100px]">
          <div className="relative top-[-15px]">
            <Spin></Spin>
          </div>
        </div>
      }
      {
        !isLoading &&
        <>
        {/* allow all users checkbox */}
        <div className="relative flex items-center mb-[0px]">
          <input ref={allowAllRef} type="checkbox" id="add-field-allow-all" name="add-field-allow-all" className="mr-[5px]" onChange={handlePermitAll} checked={isPermissionAll} />
          <label htmlFor="add-field-allow-all" className="text-[13px] cursor-pointer">Allow All Users</label>
        </div>
        <div
          className={`border border-gray-300 rounded-[3px] p-[2px] mt-[5px] transition
          ${isPermissionAll ? 'cursor-not-allowed opacity-[55%]' : ''}`}
        >
          <button type="button" className={`
            flex items-center rounded-[5px]
            bg-gray-100/60 border border-gray-300 transition
            pl-[5px] w-full py-[2px] ${isPermissionAll ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-200/80'}`}
            onClick={() => {
              if (isPermissionAll) return;
              if (field && !field.canEdit) {
                showToast('권한이 없습니다.', 'error');
                return;
              }
              setIsPopupOpen(true);
            }}
          >
            <div>
              <svg className="mr-[5px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="20" height="20" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor">
                <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"></path><path d="M16.1 12h-8.5"></path><path d="M12 7.8v8.7"></path>
              </svg>
            </div>
            <span className="text-[13px] relative top-[0.5px] ml-[2px]">Edit Permission</span>
          </button>
          <div className="p-[2px] ">
            {
              permittedList.length
                ? <ul className="px-[4px] py-[4px]">
                    {
                      permittedList.map((node, i) => (
                        <li key={i} className="flex items-center text-[13px] py-[1px] rounded-[4px] hover:bg-gray-100 cursor-default">
                          <div className="mr-[5px] relative top-[-1px]">
                          {
                            node.type === "department"
                            ? <svg
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
                            : <svg
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
                          }
                          </div>
                          <p>{node.title}</p>
                        </li>
                      ))
                    }
                  </ul>
                : <div className="text-[12px] text-center text-gray-500 font-[300] mt-[2px]">No Users & Departments Added</div>
            }
          </div>
        </div>
        </>}
      {/* Edit Permission Popup */
      isPopupOpen && createPortal(
        field ?
        <EditPermissionPopup setIsPopupOpen={setIsPopupOpen} field={field} setPermittedList={setPermittedList} />:
        <EditPermissionPopup setIsPopupOpen={setIsPopupOpen} newName={newName} setPermittedList={setPermittedList} />
        , document.body)
      }
    </>
  )
}