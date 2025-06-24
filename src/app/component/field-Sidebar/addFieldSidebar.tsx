'use client'
import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store/store";
import { setFields, setRealId } from "@/app/store/tableSlice";
import { showModal } from "../modalUtils";
import { checkDuplicateFields, addFieldToDB } from "@/app/controllers/taskController";
import { flash } from "@/app/animation";
import DropdownOptionList from "@/app/component/field-Sidebar/dropdownOptionList";
import FieldTypeList from "./fieldTypeList";
import { FieldSidebarType } from "@/global";
import PermissionList from "./permissionList";

export default function AddFieldSidebar(
  {
    setIsSidebarOpen, itemId
  }:
  {
    setIsSidebarOpen: (arg: boolean) => void,
    itemId: number
  }
) {
  const {rows, fields} = useSelector((state: RootState) =>
    state.table.data
  )
  const [isPermissionEnabled, setIsPermissionEnabled] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [additionalSetting, setAdditionalSetting] = useState<FieldSidebarType>('default');
  const dispatch = useDispatch();
  const nameRef = useRef<HTMLInputElement>(null);
  
  // text field 유효성 검사
  const validateFieldInput = async () => {
    const name = nameRef.current?.value.trim();
    // name 검사
    if (!name) {
      try {
        await showModal({
          type: 'alert',
          title: '이름을 입력해주세요.'
        });
        return;
      } catch {
        nameRef.current?.focus();
        console.log('사용자 취소');
        return;
      }
    }
    // type 검사
    if (!selectedType) {
      try {
        await showModal({
          type: 'alert',
          title: 'Type을 선택해주세요.'
        });
        return;
      } catch {
        console.log('사용자 취소');
        return;
      }
    }

    // 중복 검사
    const { isDuplicate } = await checkDuplicateFields({ name, type: selectedType });
    if (isDuplicate) {
      try {
        await showModal({
          type: 'confirm',
          title: '동일한 Name과 Type의 Field가 존재합니다.\n새로 등록하시겠습니까?',
          buttonText: {confirm: '확인'}
        });
        // continue
      } catch {
        console.log('사용자 취소');
        return;
      }
    }

    if (selectedType === "text" || selectedType === "number") {
      addField();
    } else if (selectedType === "dropdown") {
      // dropdown
      setAdditionalSetting('dropdown');
    }
  }

  // text field 추가
  const addField = async () => {
    const maxOrder = Math.max(...fields.map((field) => field.order)) + 1;
    const tempFieldId = Date.now();
    const newFields = fields.map(f => ({ ...f }));
    const name = nameRef.current?.value.trim() || '';

    const newField = {
      fieldId: tempFieldId,
      name: name,
      typeId: tempFieldId,
      type: selectedType,
      order: maxOrder,
      width: 200
    }
    newFields.push(newField);

    // redux 업데이트 (임시 id)
    dispatch(setFields({newFields}));

    try {
      addFieldToDB({
        itemId, name, type: selectedType 
      }).then((res) => {
        // real id로 업데이트
        dispatch(setRealId({
          type: 'field',
          tempId: tempFieldId,
          realId: res.field.ID,
          fieldTypeId: res.field.FIELD_TYPE_ID
        }));
      });
    } catch(err) {
      try {
        await showModal({
          type: 'alert',
          title: `DB 저장에 실패했습니다. ${err}`
        });
        return;
      } catch {
        console.log('사용자 취소');
        return;
      }
    }
    closefieldSidebar();
  }

  // Type 선택
  const handleSelectedType = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedType(e.target.value);
  }

  const closefieldSidebar = () => {
    setIsSidebarOpen(false);
  }

  return (
    <>
      {/* 닫기 버튼 (absolute) */}
      <button
        type="button" className="absolute right-[6px] hover:bg-[#ecedf1] rounded-[4px] p-[2px] cursor-pointer" onClick={closefieldSidebar}>
        <svg
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" strokeWidth="2">
          <path d="M18 6l-12 12"></path>
          <path d="M6 6l12 12"></path>
        </svg>
      </button>
      {/* sidebarType: add => field 추가 */}
      <div className={`flex flex-col justify-between h-full ${additionalSetting !== 'default' && 'hidden'}`}>
        <div className={`flex flex-col`}>
          <div className="px-[17px]">
            <h2 className="text-[16px] font-[500]">Add Field</h2>
          </div>
          {/* 구분 선 */}
          <div className="border-t border-gray-200 h-0 my-[12px]"></div>
          <div className="px-[17px]">
            <p className="text-[12px] font-[600] text-gray-500/90 mb-[8px]">Name</p>
            <input id="field-id" ref={nameRef} type="text" maxLength={50} autoComplete="off" spellCheck="false"
              className="bg-white border border-gray-400 outline-none focus:border-blue-400 rounded-[3px] px-[6px] py-[1px] transition"
            />
          </div>
          {/* 구분 선 */}
          <div className="border-t border-gray-200 h-0 my-[12px]"></div>
          <div>
            <p className="text-[12px] font-[600] text-gray-500/90 px-[17px] mb-[8px]">Type</p>
            <ul className="px-[8px]">
              {/* [Text type] */}
              <li className="rounded-[4px] hover:bg-gray-100 py-[4px] transition px-[10px] has-[input:checked]:bg-blue-100">
                <label htmlFor="add-field-type-text" className="flex items-center cursor-pointer">
                  <input id="add-field-type-text" type="radio" name="add-field-type" value="text" className="relative top-[1px] mr-[5px] w-[12px] h-[12px]" onChange={handleSelectedType} checked={selectedType === "text"} />
                  <div className="flex items-center justify-center h-[22px] w-[22px] bg-blue-200/70 rounded-[3px] mr-[7px]">
                    <svg className="text-blue-500" style={{}} xmlns="http://www.w3.org/2000/svg" width="14px" height="14px" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 3V21M9 21H15M19 6V3H5V6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="relative top-[1px]">Text</span>
                </label>
              </li>
              {/* [Number type] */}
              <li className="rounded-[4px] hover:bg-gray-100 py-[4px] transition px-[10px] has-[input:checked]:bg-blue-100">
                <label htmlFor="add-field-type-number" className="flex items-center cursor-pointer">
                  <input id="add-field-type-number" type="radio" name="add-field-type" value="number" className="relative top-[1px] mr-[5px] w-[12px] h-[12px]" onChange={handleSelectedType} checked={selectedType === "number"} />
                  <div className="flex items-center justify-center h-[22px] w-[22px] bg-green-200/65 rounded-[3px] mr-[7px]">
                    <svg className="text-green-600" width="14px" height="14px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.705 8.0675H21.295M2.705 15.9325H21.295M18.0775 2.705L14.5025 21.295M10.2125 2.705L6.6375 21.295" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                  <span className="relative top-[1px]">Number</span>
                </label>
              </li>
              {/* [Dropdown type] */}
              <li className="rounded-[4px] hover:bg-gray-100 py-[4px] transition px-[10px] has-[input:checked]:bg-blue-100">
                <label htmlFor="add-field-type-dropdown" className="flex items-center cursor-pointer">
                  <input id="add-field-type-dropdown" type="radio" name="add-field-type" value="dropdown" className="relative top-[1px] mr-[5px] w-[12px] h-[12px]"  onChange={handleSelectedType} checked={selectedType === "dropdown"} />
                  <div className="flex items-center justify-center h-[22px] w-[22px] bg-orange-200/70 rounded-[3px] mr-[7px]">
                    <svg className="text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="15px" height="15px" strokeWidth="2">
                      <path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"></path>
                      <path d="M9 11l3 3l3 -3"></path>
                    </svg>
                  </div>
                  <span className="relative top-[1px]">Dropdown</span>
                </label>
              </li>
            </ul>
          </div>
          {/* 구분 선 */}
          <div className="border-t border-gray-200 h-0 my-[12px]"></div>
          <div className="relative px-[17px]">
            <p className="text-[12px] font-[600] text-gray-500/90 mb-[8px]">Permission</p>
            {/* allow all users checkbox */}
            <div className="relative flex items-center mb-[0px]">
              <input type="checkbox" id="add-field-allow-all" name="add-field-allow-all" className="mr-[5px]" onChange={(e) => setIsPermissionEnabled(!e.target.checked)} defaultChecked={true} />
              <label htmlFor="add-field-allow-all" className="text-[13px] cursor-pointer">Allow All Users</label>
            </div>
            {/* 허가된 사용자 목록 */}
            <PermissionList isPermissionEnabled={isPermissionEnabled} newName={nameRef.current?.value || ''} />
          </div>
        </div>
        {/* 하단 버튼 */}
        <div className="relative text-center py-[18px]">
          <div className="relative text-right mr-[14px] text-[13px]">
            <button
              type="button"
              className="border border-blue-500/80 bg-blue-500/80 hover:border-blue-500/90 hover:bg-blue-500/90 w-[70px] rounded-[3px] text-white transition cursor-pointer mr-[5px] py-[2px]"
              onClick={validateFieldInput}>
              <span>{(['text', 'number', ''].includes(selectedType)) ? "Add" : "Next"}</span>
            </button>
            <button type="button" className="border border-gray-300 bg-white hover:border-gray-300 hover:bg-gray-100 w-[70px] rounded-[3px] transition cursor-pointer py-[2px]" onClick={closefieldSidebar}>Cancel</button>
          </div>
          {/* 구분 선 */}
          <div className="border-t border-gray-200 h-0 my-[17px]"></div>
          <div>
            <button
              type="button" className="border border-gray-400/90 py-[4px] px-[22px] rounded-[5px] hover:bg-blue-100/50 cursor-pointer transition"
              onClick={(e) => { e.stopPropagation(); setAdditionalSetting('existing'); }}
            >Add existing fields</button>
          </div>
        </div>
      </div>
      {/* dropdown field 추가설정 */}
      {
      additionalSetting === 'dropdown' &&
      <div className="flex flex-col">
        <div className="flex items-center px-[10px]">
          <button
            type="button"
            className="mr-[7px] hover:bg-gray-200/90 transition cursor-pointer rounded-[4px]"
            onClick={(e) => { e.stopPropagation(); setAdditionalSetting('default'); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="24" height="24" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
              <path d="M15 6l-6 6l6 6"></path>
            </svg>
          </button>
          <h2 className="text-[16px] font-[500]">{selectedType.charAt(0).toUpperCase() + selectedType.slice(1) } Setting</h2>
        </div>
        {/* dropdown setting */}
        { selectedType === "dropdown" &&
        <div className="flex flex-col">
          {/* 구분 선 */}
          <div className="border-t border-gray-200 h-0 my-[12px]"></div>
            <DropdownOptionList nameRef={nameRef} itemId={itemId} setAdditionalSetting={setAdditionalSetting} fields={fields} closefieldSidebar={closefieldSidebar} />
        </div>
        }
      </div>
      }
      {/* 기존 필드 추가 (Add existing field) */}
      {
      additionalSetting === 'existing' &&
      <div className="flex flex-col h-full">
        <div className="flex items-center px-[10px]">
          <button
            type="button"
            className="mr-[7px] hover:bg-gray-200/90 transition cursor-pointer rounded-[4px]"
            onClick={(e) => { e.stopPropagation(); setAdditionalSetting('default'); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="24" height="24" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
              <path d="M15 6l-6 6l6 6"></path>
            </svg>
          </button>
          <h2 className="text-[16px] font-[500]">Existing Fields</h2>
        </div>
        {/* 구분 선 */}
        <div className="border-t border-gray-200 h-0 my-[12px]"></div>
        <div className="flex flex-col px-[10px] overflow-y-auto">
          <FieldTypeList itemId={itemId} />
        </div>
      </div>
      }
    </>
  );
}