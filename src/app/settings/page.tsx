'use client'
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import AddGroupPopup from "./addAdminPopup";
import { deleteUserFromAdminListOnDB, getAdminListFromDB } from "../controllers/userController";
import AdminTable from "./adminTable";
import { showModal } from "../component/modalUtils";

export default function Main() {
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // add group popup 
  const handleAddAdminPopup = () => {
    setIsAddPopupOpen(prev => !prev);
  }

  // admin list
  const [adminList, setAdminList] = useState<{userId: string; userName: string; isActive: string}[]>([]);

  // list 로드 함수
  const fetchAdmins = async () => {
    await getAdminListFromDB()
      .then((res) => setAdminList(res.data || []))
      .catch((err) => console.error("Failed to fetch admin list:", err));
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchAdmins();
      setIsLoading(false);
    }
    loadData();
    
  }, []);

  // checkbox 상태 관리
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const handleCheckbox: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // 전체 check 여부
  const isAllChecked = adminList.length > 0 && checkedIds.size === adminList.length;

  // 전체 check
  const handleCheckAll = () => {
    setCheckedIds(prev => {
      if (isAllChecked) {
        return new Set(); // 전체 해제
      } else {
        return new Set(adminList.map(row => row.userId)); // 전체 체크
      }
    });
  };

  // admin 삭제
  const handleDeleteRow = async () => {
    if (checkedIds.size === 0) {
      try {
        await showModal({
          type: 'alert',
          title: '삭제할 관리자를 선택해주세요.',
        });
      } catch {
        console.log('확인');
      }
      return;
    }

    // 확인 모달
    try {
      await showModal({
        type: 'delete',
        title: `선택한 사용자를 관리자 목록에서 제외하시겠습니까? (${checkedIds.size}명)`,
      });
      console.log('확인');
      // continue
    } catch {
      console.log('취소');
      // exit
      return;
    }

    const deleteIds = Array.from(checkedIds);
    const newAdminList = structuredClone(adminList)
      .filter((row) => !deleteIds.includes(row.userId));
    // 화면 update
    setAdminList(newAdminList);
    // DB update
    deleteUserFromAdminListOnDB({userIds: deleteIds})
      .then(async (res) => {
        if (res.result === 'success') {
          try {
            await showModal({
              type: 'alert',
              title: '제외되었습니다.',
            })
          } catch {
            console.log('확인');
            fetchAdmins();
          }
          return;
        } else {
          try {
            await showModal({
              type: 'alert',
              title: '오류가 발생했습니다.',
            })
          } catch {
            console.log('확인');
          }
          return;
        }
      });
  }

  return (
    <div className='flex flex-col p-[15px] pt-[20px] overflow-auto w-full min-w-[400px]'>
      <div className='flex items-center h-[32px] pl-[15px]'>
        <h1 className='text-[15px] font-[600] '>관리자 목록</h1>
      </div>
      <div className='pl-[15px]'>
        <div className="flex py-[2px]">
          {/* Add Admin Button */}
          <button type="button"
            className="flex items-center justify-center py-[2px] pl-[5px] pr-[7px] mr-[2px]
            hover:bg-gray-200/70 cursor-pointer transition rounded-[4px]"
            onClick={handleAddAdminPopup}
          >
            <svg className="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="19" height="19" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor">
              <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"></path>
              <path d="M16.1 12h-8.5"></path>
              <path d="M12 7.8v8.7"></path>
            </svg>
            <span className="ml-[3px] text-[14px] relative top-[0.5px]">Add</span>
          </button>
          { // add group popup 
            isAddPopupOpen && createPortal(
              <AddGroupPopup handleAddAdminPopup={handleAddAdminPopup} fetchAdmins={fetchAdmins} />
            , document.body)
          }
          {/* Delete Admin Button */}
          <button type="button"
            className="flex items-center justify-center py-[2px] pl-[5px] pr-[7px] hover:bg-gray-200/70 cursor-pointer transition rounded-[4px]"
            onClick={handleDeleteRow}
          >
            <svg className="" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M4 7l16 0" />
              <path d="M10 11l0 6" />
              <path d="M14 11l0 6" />
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
            </svg>
            <span className="ml-[3px] text-[14px] relative top-[0.5px]">Delete</span>
          </button>
        </div>
        <AdminTable
          adminList={adminList}
          setAdminList={setAdminList}
          fetchAdmins={fetchAdmins}
          handleCheckAll={handleCheckAll}
          isAllChecked={isAllChecked}
          checkedIds={checkedIds}
          handleCheckbox={handleCheckbox}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}