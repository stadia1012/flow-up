'use client';
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DropdownOption from "@/app/component/field-Sidebar/dropdownOption";
import AddDropdownOption from "./addDropdownOption";
import { addDropdownFieldToDB } from "@/app/controllers/taskController";
import { showModal } from "../modalUtils";
import { setDropdownOptionsId, setFields, setRealId } from "@/app/store/tableSlice";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { flash } from "@/app/animation";
import { FieldSidebarType } from "@/global";

export default function DropdownOptionList(
  {
    nameRef,
    itemId,
    setSidebarType,
    fields,
    closefieldSidebar
  }: {
    nameRef: React.RefObject<HTMLInputElement | null>,
    itemId: number,
    setSidebarType: (arg: FieldSidebarType) => void,
    fields: TaskField[],
    closefieldSidebar: () => void
  }) {
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([
    {id: crypto.randomUUID(), order: 0, color: "3dce72", name: "Option 1"},
    {id: crypto.randomUUID(), order: 1, color: "ff7800", name: "Option 2"},
    {id: crypto.randomUUID(), order: 2, color: "f7d92b", name: "Option 3"}]
  );
  const dispatch = useDispatch();
  
  // option 추가
  const addDropdownOption = (newOption: DropdownOption) => {
    setDropdownOptions((prev) => [
      ...prev,
      newOption
    ]);
  }
  // option 삭제
  const deleteDropdownOption = (newOption: DropdownOption) => {
    console.log(newOption);
    setDropdownOptions((prev) => {
      return prev.filter(option => option.id !== newOption.id);
    });
  }

  // dropdown 유효성 검사
  const validateDropdownInput = async () => {
    let emptyNameCount = 0;
    // name 검사
    document.querySelectorAll(`input[data-input='optionName']`).forEach((el) => {
      const input = el as HTMLInputElement
      if ((input.value) === '') {
        emptyNameCount++;
        el.closest('li')?.classList.add('alert');
        setTimeout(() => {
          el.closest('li')?.classList.remove('alert');
        }, 1500);
      }
    });
    if (emptyNameCount > 0) {
      return
    }

    const maxOrder = Math.max(...fields.map((field) => field.order)) + 1;
    const tempFieldId = Date.now();
    const newFields = fields.map(f => ({ ...f }));
    const name = nameRef.current?.value.trim() || '';
    const newField = {
      fieldId: tempFieldId,
      name: name,
      typeId: tempFieldId,
      type: 'dropdown',
      order: maxOrder,
      width: 200,
      dropdownOptions: dropdownOptions
    }
    newFields.push(newField);

    // redux 업데이트 (임시 id)
    dispatch(setFields({newFields}));

    // DB 업데이트
    try {
      addDropdownFieldToDB({
        options: dropdownOptions,
        itemId: itemId,
        name,
        type: 'dropdown' 
      }).then((res) => {
          // real id로 업데이트
          dispatch(setRealId({
            type: 'field',
            tempId: tempFieldId,
            realId: res.fields.ID,
            fieldTypeId: res.fields.FIELD_TYPE_ID
          }));

          // options real id 업데이트
          dispatch(setDropdownOptionsId({
            fieldTypeId: res.fields.FIELD_TYPE_ID,
            options: res.options
          }));
        })
    } catch(err) {
      try {
        await showModal({
          type: 'alert',
          title: `DB 저장에 실했습니다. ${err}`
        });
        return;
      } catch {
        console.log('사용자 취소');
        return;
      }
    }
    closefieldSidebar();
  }

  // 드래그 앤 드롭 - 드롭 영역
  const containerRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    return dropTargetForElements({
      element: container,
      canDrop({ source }) {
        return true;
      },
      onDrop({ source, location }) {
        const sourceData = source.data;
        if (!sourceData || !("optionId" in sourceData) || !("order" in sourceData)) return;

        const target = location.current.dropTargets[0];

        const targetData = target.data;
        if (!targetData || !("optionId" in targetData) || !("order" in targetData)) return;
        
        console.log(`target:`, target);
        console.log(`source:`, source);

        const targetOrder = Number(targetData.order);
        const closestEdge = extractClosestEdge(targetData);
        let updateOrder = closestEdge === "top" ? targetOrder : targetOrder + 1;

        const newOptions = dropdownOptions.map((el: any) => ({ ...el }));
        if (updateOrder > Number(sourceData.order)) {
          // 후순서로 이동
          console.log('후순서 이동');
          // 소스 ~ 타켓 order -1
          updateOrder--; // 조정
          newOptions.forEach((el: any) => {
            if (el.order >= sourceData.order! && el.order <= updateOrder) {
              el.order -= 1
            }
          });
        } else {
          // 선순서로 이동
          console.log('선순서 이동');
          // 타겟 ~ 소스 order +1
          newOptions.forEach((el: any) => {
            if (el.order >= updateOrder && el.order <= sourceData.order!) {
              el.order += 1
            }
          });
        }
        // 대상 업데이트
        const sourceRow = newOptions.find((el: DropdownOption) => el.id === sourceData.optionId);
        if (!sourceRow) return;
        sourceRow.order = updateOrder;
    
        console.log('updateOrder: ', updateOrder);
        console.log('sourceData.order: ', Number(sourceData.order));

        setDropdownOptions(newOptions);

        // 이동 후 flash
        const element = document.querySelector(`[data-option-id="${sourceData.optionId}"]`);
        if (element) {
          setTimeout(() => {
            flash(element);
          }, 10)
        }
      },
    });
  }, [dropdownOptions]);
  return (
    <>
      <div className="">
        <p className="text-[12px] font-[600] text-gray-500/90 mx-[14px]">Dropdown Options</p>
        {/* dropdown option list */}
        <ul className="max-h-[300px] overflow-y-auto pt-[8px] pb-[1px]" ref={containerRef}>
        {
          [...dropdownOptions].sort((a, b) => a.order - b.order).map((option, idx) => {
            return (
              <DropdownOption
                key={option.id}
                option={option}
                deleteOption={deleteDropdownOption}
                tabIdx={idx}
              />
            )
          })
        }
        {/* add dropdown option */}
        </ul>
        <AddDropdownOption dropdownOptions={dropdownOptions} addDropdownOption={addDropdownOption} />
      </div>
      {/* [Add] / [Cancel] button wrapper of dropdown */}
      <div className="text-right mr-[14px] text-[13px]">
        <button
          type="button"
          className="border border-blue-500/80 bg-blue-500/80 hover:border-blue-500/90 hover:bg-blue-500/90 w-[70px] rounded-[3px] text-white transition cursor-pointer mr-[5px] py-[2px]"
          onClick={validateDropdownInput}>
          <span>Add</span>
        </button>
        <button type="button" className="border border-gray-300 bg-white hover:border-gray-300 hover:bg-gray-100 w-[70px] rounded-[3px] transition cursor-pointer py-[2px]" onClick={() => setSidebarType("add")}>Cancel</button>
      </div>
    </>
  );
}