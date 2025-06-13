'use client';
import { useState, useRef, useEffect } from "react";
import DropdownOption from "@/app/component/field-Sidebar/dropdownOption";
import AddDropdownOption from "./addDropdownOption";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { flash } from "@/app/animation";

export default function EditDropdownOptionList(
  {
    field,
    dropdownOptions,
    setDropdownOptions
  }: {
    field: TaskField,
    dropdownOptions: DropdownOption[],
    setDropdownOptions: (arg: DropdownOption[]) => void
  }) {
  
  // option 추가
  const addDropdownOption = (newOption: DropdownOption) => {
    setDropdownOptions([
      ...dropdownOptions,
      newOption
    ])
  }
  // option 삭제
  const deleteDropdownOption = (newOption: DropdownOption) => {
    console.log(newOption);
    setDropdownOptions(
      dropdownOptions.filter(option => option.id !== newOption.id)
    );
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
        const element = document.querySelector(`#field-sidebar-wrapper [data-option-id="${sourceData.optionId}"]`);
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
    </>
  );
}