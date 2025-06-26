'use client'
import { useState, useRef } from "react";
import EditDropdownOptionList from "./editDropdownOptionList";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store/store";
import type { AppDispatch } from "@/app/store/store";
import { setDropdownOptionsId, setFields } from "@/app/store/tableSlice";
import { savePermissionToDB, updateFieldTypeFromDB } from "@/app/controllers/taskController";
import PermissionList from "./permissionList";
import { useToast } from "@/app/context/ToastContext";
import { OrgTreeNode } from "@/global";
export default function EditFieldSidebar(
  {setIsSidebarOpen, field}:
  {
    setIsSidebarOpen: (arg: boolean) => void,
    field: TaskField,
  }
) {
  const dispatch: AppDispatch = useDispatch();
  const {showToast} = useToast();
  const [permittedList, setPermittedList] = useState<OrgTreeNode[]>([]);
  // 전체 허용 여부
  const [isPermitAll, setIsPermitAll] = useState(false);

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
  
  /* 저장 (Save Button) */
  const hadleSaveField = async () => {
    if (!field.canEdit) {
      showToast('권한이 없습니다.', 'error');
      return;
    }

    if (nameRef.current && !nameRef.current.value.trim()) {
      showToast('이름을 입력해주세요.', 'error');
      return;
    }

    if (!isPermitAll && !permittedList.length) {
      showToast('최소 1개 이상의 권한을 추가해주세요.', 'error');
      return;
    }

    const newFields = structuredClone(fields);

    /* (1) field type 업데이트 */ 
    newFields.forEach(f => {
      if (f.fieldId === field.fieldId) {
        f.name = nameRef.current!.value.trim();
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
        name: nameRef.current!.value.trim(),
        dropdownOptions: dropdownOptions
    }).then((res) => {
      console.log(res);
      // options real id 업데이트
      dispatch(setDropdownOptionsId({
        fieldTypeId: field.typeId,
        options: res ?? {}
      }));
    })

    /* (2) permission 업데이트 */ 
    if (!field?.fieldId) {
      showToast('오류가 발생했습니다.', 'error');
      return;
    }

    try {
      const result = await savePermissionToDB({
        resourceType: 'field',
        resourceId: field.typeId,
        permissions: permittedList
      });

      if (result.result !== 'success') {
        // 상세한 에러 메시지 표시
        const errorMessage = result.message || '권한 저장 중 오류가 발생했습니다.';
        showToast(errorMessage, 'error'); 
      }
    } catch (error) {
      // 에러 처리
      console.error('Unexpected error in handleSavePermission:', error);
      showToast('오류가 발생했습니다.', 'error');
    }

    showToast('저장되었습니다.', 'success');
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
        {/* naem */}
        <div className="px-[17px]">
          <p className="text-[12px] font-[600] text-gray-500/90 mb-[8px]">Name</p>
          <input id="field-id" ref={nameRef} type="text" maxLength={50} autoComplete="off" spellCheck="false" defaultValue={field.name}
            className="bg-white border border-gray-400 outline-none focus:border-blue-400 rounded-[3px] px-[6px] py-[1px] transition"
          />
        </div>
        {/* dropdown options list */}
        {
        field.type === 'dropdown' && <>
          {/* 구분 선 */}
          <div className="border-t border-gray-200 h-0 my-[12px]"></div>
          <EditDropdownOptionList field={field} dropdownOptions={dropdownOptions} setDropdownOptions={setDropdownOptions} />
        </>
        }
        {/* 구분 선 */}
        <div className="border-t border-gray-200 h-0 my-[12px]"></div>
        {/* Permission */}
        <div className="relative px-[17px]">
          <p className="text-[12px] font-[600] text-gray-500/90 mb-[8px]">Permission</p>
          {/* 허가된 사용자 목록 */}
          <PermissionList field={field} permittedList={permittedList} setPermittedList={setPermittedList} isPermitAll={isPermitAll} setIsPermitAll={setIsPermitAll} />
        </div>
        {/* [Save] / [Cancel] button wrapper */}
        <div className="text-right mr-[14px] text-[13px] mt-[12px]">
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