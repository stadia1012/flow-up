import { useEffect, useState } from "react";
import AdminTableRow from "./adminTableRow";
import { Spin } from "antd";

export default function AdminTable(
  {
    adminList,
    fetchAdmins,
    setAdminList,
    handleCheckAll,
    isAllChecked,
    checkedIds,
    handleCheckbox,
    isLoading
  }: {
    adminList: {userId: string; userName: string; isActive: string}[],
    fetchAdmins: () => void,
    setAdminList: (list: {userId: string; userName: string; isActive: string}[]) => void,
    handleCheckAll: () => void,
    isAllChecked: boolean,
    checkedIds: Set<string>,
    handleCheckbox: React.ChangeEventHandler<HTMLInputElement>,
    isLoading: boolean
  }) {
  return (
    <>
    <table className="w-max">
      <thead>
        <tr className="border-b border-transparent">
          <th className="w-[35px] h-[30px]">
            <div className="flex items-center justify-center border-b border-gray-300 h-full">
              <input type="checkbox" onChange={handleCheckAll} checked={isAllChecked} />
            </div>
          </th>
          <th className="min-w-[150px] h-[30px]">
            <div className="flex items-center justify-center font-[500] text-[14px] border-b border-gray-300 h-full">ID</div>
          </th>
          <th className="min-w-[150px] h-[30px]">
            <div className="flex items-center justify-center font-[500] text-[14px] border-b border-gray-300 h-full">User Name</div>
          </th>
          <th className="min-w-[100px] h-[30px]">
            <div className="flex items-center justify-center font-[500] text-[14px] border-b border-gray-300 h-full">Status</div>
          </th>
        </tr>
      </thead>
      <tbody>
        {/* row */
        isLoading ? 
          <tr>
            <td colSpan={4} className="h-[100px] translate-x-1/2 relative left-[-50%]">
              <div className="flex items-center justify-center h-full">
                <Spin></Spin>
              </div>
            </td>
          </tr>
        : adminList.length ?
        adminList.map((admin, i) => (
          <AdminTableRow admin={admin} key={i} checkedIds={checkedIds} handleCheckbox={handleCheckbox} fetchAdmins={fetchAdmins} adminList={adminList} setAdminList={setAdminList} />
        ))
        : (
          <tr>
            <td colSpan={4} className="text-center text-gray-500 py-[10px] text-[14px]">
              등록된 관리자가 없습니다.
            </td>
          </tr>
        )
      }
      </tbody>
      </table>
    </>
  )
}