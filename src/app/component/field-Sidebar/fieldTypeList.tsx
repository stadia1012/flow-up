'use client'
import { getAllFieldTypes, getFieldTypes, hadleFieldHiddenFromDB } from "@/app/controllers/taskController";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store/store";
import { TaskFieldType } from "@/global";
import { useEffect, useState } from "react";
import FieldType from "./fieldType";
import { setFields, setRealId } from "@/app/store/tableSlice";
import { Session } from "next-auth";
import { useToast } from "@/app/context/ToastContext";

export default function FieldTypeList({itemId}: {itemId: number}) {
  const dispatch = useDispatch();
  const [fieldTypes, setFieldTypes] = useState<TaskFieldType[]>([]);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set()); // 등록된 id 목록
  const [lastToggledId, setLastToggledId] = useState<number | null>(null); // 변경된 id
  const {rows, fields} = useSelector((state: RootState) =>
    state.table.data
  )
  const {showToast} = useToast();

  // DB에서 item fieldTypes 가져오기
  useEffect(() => {
    getFieldTypes({itemId})
      .then((res) => {
        setCheckedIds(prev => {
          const next = new Set(prev);
          res.forEach(f => next.add(f.id));
          return next;
        });
      })
      .catch((err) => {
        console.error("Failed to load field types:", err);
      });
  }, []);

  // DB에서 fieldTypes 가져오기
  useEffect(() => {
    getAllFieldTypes()
      .then((res) => {
        setFieldTypes(res);
      })
      .catch((err) => {
        console.error("Failed to load field types:", err);
      });
  }, []);

  // check 상태 변경
  const handleCheckbox: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    const id = Number(e.currentTarget.closest('li')?.dataset.id);
    if (!id) return;
    // 상태 변경
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setLastToggledId(id);
  };

  // 변경된 field DB에서 변경
  useEffect(() => {
    if (lastToggledId === null) return;
    const updateField = async () => {
      const isChecked = checkedIds.has(lastToggledId);

      // 대상 fieldType
      const newFieldType = fieldTypes.find(ft => ft.fieldTypeId == lastToggledId);
      if (isChecked) {
        // redux 업데이트 준비
        const maxOrder = Math.max(...fields.map((field) => field.order)) + 1;
        const tempFieldId = Date.now();
        const newFields = fields.map(f => ({ ...f }));

        const newField = {
          fieldId: tempFieldId, // 임시 값
          name: newFieldType?.name || '',
          typeId: tempFieldId,
          type: newFieldType?.type || 'text',
          order: maxOrder,
          width: 200,
          dropdownOptions: newFieldType?.dropdownOptions,
          canEdit: false // 임시 값
        }
        newFields.push(newField);

        // redux 업데이트 (임시 id)
        dispatch(setFields({newFields}));

        // DB field 추가
        try {
          hadleFieldHiddenFromDB({
            fieldTypeId: lastToggledId,
            itemId: itemId,
            isHidden: false
          }).then(async (res) => {
            // real id로 업데이트
            if (!res?.field.ID || !res?.field.FIELD_TYPE_ID) return;

            // 권한여부 구하기
            const response = await fetch("/api/session/");
            // 응답이 성공적인지 확인
            if (!response.ok) {
              throw new Error('Failed to fetch session');
            }
            const {session}: {session: Session} = await response.json();
            // session과 user가 존재하는지 확인
            if (!session || !session.user) {
              showToast('로그인 상태를 확인해주세요.', 'error');
              return;
            }

            const canEdit = (
              session?.user.isAdmin === true
              // 전체 허용 검사
              || (res.permissions?.IS_PERMIT_ALL === "Y") ? true : false 
              // 사용자 권한 검사
              || res.permissions?.userPermissions.some(perm => perm.USER_ID === session.user.id)
              // 소속부서 권한 검시
              || res.permissions?.deptPermissions.some(perm => session?.user.ancestorDepts?.includes(perm.DEPT_CODE))
            )
  
            dispatch(setRealId({
              type: 'field',
              tempId: tempFieldId,
              realId: res.field.ID,
              fieldTypeId: res.field.FIELD_TYPE_ID,
              canEdit
            }));
          });
        } catch (err) {
          alert('DB 저장에 실패했습니다.');
        }
      } else {
        // redux 업데이트 (숨기기)
        const newFields = fields.filter((f) => f.typeId !== newFieldType?.fieldTypeId);
        dispatch(setFields({newFields}));

        try {
          // DB field 숨기기
          hadleFieldHiddenFromDB({
            fieldTypeId: lastToggledId,
            itemId: itemId,
            isHidden: true
          });
        } catch (err) {
          alert('DB 저장에 실패했습니다.');
        }
        
      }
    }
    updateField();
  }, [checkedIds, lastToggledId]);
  return (
    <ul>
      <p className="text-[12px] font-[600] text-gray-500/90 mb-[8px]">Shown</p>
      {Array.from(checkedIds).map((id, i) => {
        const ft = fieldTypes.find(f => f.fieldTypeId === id)
        if (!ft || ft.fieldTypeId === 1) return null;
        return (
          <FieldType
            key={i}
            fieldType={ft}
            handleCheckbox={handleCheckbox}
            isChecked={true}
          />
        )
      })}
      {/* 구분 선 */}
      <div className="border-t border-gray-200 h-0 my-[12px]"></div>
      <p className="text-[12px] font-[600] text-gray-500/90 mb-[8px]">Hidden</p>
      {fieldTypes
        .filter((f) => f.fieldTypeId !== 1 && !checkedIds.has(f.fieldTypeId))
        // name(id: 1) 제외, 체크 안된 항목만
        .map((fieldType, i) => (
          <FieldType key={i} fieldType={fieldType} handleCheckbox={handleCheckbox} isChecked={false} />
        )
      )}
    </ul>
  )
}