'use client'
import { useState, useRef } from "react";
import EditDropdownOptionList from "./editDropdownOptionList";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store/store";
import type { AppDispatch } from "@/app/store/store";
import { setDropdownOptionsId, setFields } from "@/app/store/tableSlice";
import { updateFieldTypeFromDB } from "@/app/controllers/taskController";
export default function EditFieldSidebar(
  {setIsSidebarOpen, field}:
  {
    setIsSidebarOpen: (arg: boolean) => void,
    field: TaskField,
  }
) {
  const dispatch: AppDispatch = useDispatch();
  const [isPermissionEnabled, setIsPermissionEnabled] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  // field를 추가할 때와 달리 수정 시에는 dropdownOptions가 redux store를 구독하므로
  // 깊은 복사 후 save 버튼을 클릭 시 slice 액션을 통해 redux state 업데이트 처리
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>(() =>
  field.dropdownOptions
    ? structuredClone(field.dropdownOptions)
    : []
);
  const {rows, fields} = useSelector((state: RootState) =>
    state.table.data
  )

  // sidebar 닫기
  const closeFieldSidebar = () => {
    setIsSidebarOpen(false);
  }
  
  // 저장
  const hadleSaveField = () => {
    const newFields = structuredClone(fields);

    newFields.forEach(f => {
      if (f.fieldId === field.fieldId) {
        f.name = nameRef.current?.value || 'unknown';
        if (field.type === 'dropdown') {
          f.dropdownOptions = dropdownOptions
        }
      }
    });
    // redux state 업데이트 처리
    dispatch(setFields({
      newFields: newFields
    }));

    // DB 업데이트 처리
    updateFieldTypeFromDB({
        fieldTypeId: field.typeId,
        name: field.name,
        dropdownOptions: dropdownOptions
    }).then((res) => {
      console.log(res);
      // options real id 업데이트
      dispatch(setDropdownOptionsId({
        fieldTypeId: field.typeId,
        options: res ?? {}
      }));
    })
    closeFieldSidebar();
  }

  return (
    <>
      {/* 닫기 버튼 (absolute) */}
      <button
        type="button" className="absolute right-[6px] hover:bg-[#ecedf1] rounded-[4px] p-[2px] cursor-pointer" onClick={closeFieldSidebar}>
        <svg
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" strokeWidth="2">
          <path d="M18 6l-12 12"></path>
          <path d="M6 6l12 12"></path>
        </svg>
      </button>
      {/* sidebarType: edit => text/number field 수정 */}
      <div className="flex flex-col">
        <div className="flex items-center px-[10px]">
          <h2 className="text-[16px] font-[500]">Edit Field</h2>
        </div>
        {/* 구분 선 */}
        <div className="border-t border-gray-200 h-0 my-[12px]"></div>
        <div className="px-[17px]">
          <p className="text-[12px] font-[600] text-gray-500/90 mb-[8px]">Name</p>
          <input id="field-id" ref={nameRef} type="text" maxLength={50} autoComplete="off" spellCheck="false" defaultValue={field.name}
            className="bg-white border border-gray-400 outline-none focus:border-blue-400 rounded-[3px] px-[6px] py-[1px] transition"
          />
        </div>
        {/* 구분 선 */}
        <div className="border-t border-gray-200 h-0 my-[12px]"></div>
        {
          field.type === 'dropdown' && <>
            <EditDropdownOptionList field={field} dropdownOptions={dropdownOptions} setDropdownOptions={setDropdownOptions} />
            <div className="border-t border-gray-200 h-0 my-[12px]"></div>
          </>
        }
        {/* Permission */}
        <div className="relative px-[17px]">
          <p className="text-[12px] font-[600] text-gray-500/90 mb-[8px]">Permission</p>
          {/* allow all users checkbox */}
          <div className="relative flex items-center mb-[0px]">
            <input type="checkbox" id="add-field-allow-all" name="add-field-allow-all" className="mr-[5px]" onChange={(e) => setIsPermissionEnabled(!e.target.checked)} defaultChecked={true} />
            <label htmlFor="add-field-allow-all" className="text-[13px] cursor-pointer">Allow All Users</label>
          </div>
          {/* 허가된 사용자 목록 */}
          <div className={`border border-gray-300 rounded-[3px] p-[2px] mt-[5px] transition
          ${!isPermissionEnabled ? 'cursor-not-allowed opacity-[55%]' : ''}`}>
            <button type="button" className={`
              flex items-center rounded-[5px]
              bg-gray-100/60 border border-gray-300 transition
              pl-[5px] w-full py-[2px] ${!isPermissionEnabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-200/80'}`}>
              <div>
                <svg className="mr-[5px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="20" height="20" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor">
                  <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"></path><path d="M16.1 12h-8.5"></path><path d="M12 7.8v8.7"></path>
                </svg>
              </div>
              <span className="text-[13px] relative top-[1px]">Add User / Group</span>
            </button>
            <div className="p-[2px] text-[12px]">
              <div className="text-center text-gray-500 font-[300] mt-[2px]">No User / Group Added</div>
            </div>
          </div>
        </div>
        {/* 구분 선 */}
        <div className="border-t border-gray-200 h-0 my-[12px]"></div>
        {/* [Save] / [Cancel] button wrapper */}
      <div className="text-right mr-[14px] text-[13px]">
        <button
          type="button"
          className="border border-blue-500/80 bg-blue-500/80 hover:border-blue-500/90 hover:bg-blue-500/90 w-[70px] rounded-[3px] text-white transition cursor-pointer mr-[5px] py-[2px]"
          onClick={hadleSaveField}
          >
          <span>Save</span>
        </button>
        <button type="button" className="border border-gray-300 bg-white hover:border-gray-300 hover:bg-gray-100 w-[70px] rounded-[3px] transition cursor-pointer py-[2px]" onClick={() => setIsSidebarOpen(false)}>Cancel</button>
      </div>
      </div>
    </>
  );
}