import { HoverTooltip } from "../component/hoverTooltip";
import { updateAdminStatusOnDB } from "../controllers/userController";

export default function AdminTableRow(
  {
    admin, checkedIds, handleCheckbox, fetchAdmins, setAdminList, adminList
  }:
  {
    admin: {userId: string; userName: string; isActive: string},
    checkedIds: Set<string>,
    handleCheckbox: React.ChangeEventHandler<HTMLInputElement>,
    fetchAdmins: () => void,
    setAdminList: (list: {userId: string; userName: string; isActive: string}[]) => void,
    adminList: {userId: string; userName: string; isActive: string}[]
  }) {
  const handleStatusChange = () => {
    const newStatus = admin.isActive === 'Y' ? 'N' : 'Y';
    const newAdminList = structuredClone(adminList);
    const index = newAdminList.findIndex(user => user.userId === admin.userId);
    if (index !== -1) {
      newAdminList[index].isActive = newStatus;
    }
    // state 변경
    setAdminList(newAdminList);
    // DB 업데이트
    updateAdminStatusOnDB({
      userId: admin.userId,
      isActive: newStatus
    });
    fetchAdmins(); // DB 업데이트 후 상태 재조회
  }
  return (
    <tr className="hover:bg-gray-100/90 transition h-[28px] box-border">
      {/* checkbox */}
      <td>
        <div className="flex items-center justify-center">
          <input type="checkbox" checked={checkedIds.has(admin.userId)} data-id={admin.userId} onChange={handleCheckbox} />
        </div>
      </td>
      {/* ID */}
      <td>
        <div className="text-[14px] text-center">{admin.userId}</div>
      </td>
      {/* department */}
      <td>
        <div className="text-[14px] text-center">{admin.userName}</div>
      </td>
      {/* status */}
      <td>
        <div className="flex justify-center">
          <HoverTooltip content={admin.isActive === 'Y' ? 'active' : 'inactive'}>
            <button
              type="button"
              className="cursor-pointer hover:bg-gray-200/80 transition rounded-[6px] h-[23px] w-[23px] p-[2px]"
              onClick={handleStatusChange}
            >
              {admin.isActive === 'Y' ? (
                <svg
                  className="text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 6a7.75 7.75 0 1 0 10 0" />
                  <path d="M12 4l0 8" />
                </svg>
              ) : (
                <svg
                  className="text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 6a7.75 7.75 0 1 0 10 0" />
                  <path d="M12 4l0 8" />
                </svg>
              )}
            </button>
          </HoverTooltip>
        </div>
      </td>
    </tr>
  )
}