'use client'
import { useEffect, useState, useRef } from 'react'
import { flash } from "@/app/animation";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import ItemTableRow from './itemTableRow';
import AddRowButton from './addRowButton';
import { moveTaskRow, addTaskRowToDB, updateValueToDB, deleteTaskRowFromDB } from '@/app/controllers/taskController';
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch } from "@/app/store/store";
import { setTableData, setValues, setRealId } from "@/app/store/tableSlice";
import type { RootState } from "@/app/store/store";
import ItemTableHeadContainer from './itemTableHeadContainer';
import { showModal } from '../modalUtils';

export default function ItemTable({initialTableData, item}: {
  initialTableData: {
    rows: TaskRow[];
    fields: TaskField[];
  },
  item: List
}) {
  // server에서 받은 projects를 redux에 반영
  useEffect(() => {
    dispatch(setTableData({
      initialTableData: initialTableData
    }));
  }, [initialTableData]);

  const {rows, fields} = useSelector((state: RootState) =>
    state.table.data!
  )
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const dispatch: AppDispatch = useDispatch();

  // task (row) 추가
  const addTaskRow = (name: string) => {
    const newRows = rows.map(el => ({ ...el, values: {...el.values} }));
    const maxOrder = newRows.reduce(
      (max, el) => (typeof el.order === 'number' && el.order > max ? el.order : max), 0
    );

    // 임시 rowId 생성
    const tempRowId = Date.now();
    const newRow: TaskRow = {
      values: {},
      rowId: tempRowId,
      order: maxOrder + 1,
    };

    // 'name' 타입에 name 할당
    const nameField = fields.find(f => f.type === 'name');
    fields.forEach(f => {
      newRow.values[f.fieldId] = (f.fieldId === nameField?.fieldId) ? name : '';
    });

    // 상태 업데이트
    newRows.push(newRow);
    dispatch(setValues({newRows: [...newRows]}));

    // flash
    setTimeout(() => {
      const el = document.querySelectorAll(`[data-row-id="${tempRowId}"] td`);
      if (el) {
        el.forEach(td => flash(td));
      }
    }, 10);

    // DB에 추가
    addTaskRowToDB({
      itemId: item.id,
      fieldId: nameField?.fieldId || 0,
      name
    }).then((res) => {
      dispatch(setRealId({type: 'row', tempId: tempRowId, realId: res.ID}));
    });
  }

  // value update
  const updateValue = ({rowId, fieldId, value} : {rowId: number, fieldId: number, value: string}) => {
    // state update
    const newRows = rows.map(el => ({ ...el, values: {...el.values} }));
    const targetRow = newRows.find((row: TaskRow) => row.rowId === rowId);
    if (!targetRow) return;
    targetRow.values[fieldId] = value;
    dispatch(setValues({newRows: [...newRows]}));

    // DB update
    updateValueToDB({rowId, fieldId, value});
    console.log(rowId,',', fieldId,',', value)
  }

  const handleCheckbox: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    const id = Number(e.currentTarget.dataset.id);
    if (!id) return;
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // 전체 check 여부
  const isAllChecked = rows.length > 0 && checkedIds.size === rows.length;

  // 전체 check
  const handleCheckAll = () => {
    setCheckedIds(prev => {
      if (isAllChecked) {
        return new Set(); // 전체 해제
      } else {
        return new Set(rows.map(row => row.rowId)); // 전체 체크
      }
    });
  };

  // 드래그 앤 드롭 - 드롭 영역
  const containerRef = useRef<HTMLTableSectionElement>(null);
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
        if (!sourceData || !("rowId" in sourceData) || !("order" in sourceData)) return;

        const target = location.current.dropTargets[0];

        const targetData = target.data;
        if (!targetData || !("rowId" in targetData) || !("order" in targetData)) return;
        
        console.log(`target:`, target);
        console.log(`source:`, source);

        const targetOrder = Number(targetData.order);
        const closestEdge = extractClosestEdge(targetData);
        let updateOrder = closestEdge === "top" ? targetOrder : targetOrder + 1;

        const newRows = rows.map((el: any) => ({ ...el }));
        if (updateOrder > Number(sourceData.order)) {
          // 후순서로 이동
          console.log('후순서 이동');
          // 소스 ~ 타켓 order -1
          updateOrder--; // 조정
          newRows.forEach((el: any) => {
            if (el.order >= sourceData.order! && el.order <= updateOrder) {
              el.order -= 1
            }
          });
        } else {
          // 선순서로 이동
          console.log('선순서 이동');
          // 타겟 ~ 소스 order +1
          newRows.forEach((el: any) => {
            if (el.order >= updateOrder && el.order <= sourceData.order!) {
              el.order += 1
            }
          });
        }
        // 대상 업데이트
        const sourceRow = newRows.find((el: TaskRow) => el.rowId === sourceData.rowId);
        if (!sourceRow) return;
        sourceRow.order = updateOrder;
          
        console.log('updateOrder: ', updateOrder);
        console.log('sourceData.order: ', Number(sourceData.order));
        dispatch(setValues({newRows: [...newRows]}));

        // DB 변경
        moveTaskRow({
          rowId: Number(sourceData.rowId),
          sourceOrder: Number(sourceData.order),
          updateOrder
        });

        // 이동 후 flash
        setTimeout(() => {
          const el = document.querySelectorAll(`[data-row-id="${sourceData.rowId}"] td`);
          if (el) {
            el.forEach(td => flash(td));
          }
        }, 10);
      },
    });
  }, [rows]);

  // row 삭제
  const handleDeleteRow = () => {
    const deleteIds = Array.from(checkedIds)
    // redux update
    const newRows = rows.map((el: any) => ({ ...el }))
      .filter((row) => !deleteIds.includes(row.rowId));
    dispatch(setValues({newRows: [...newRows]}));

    // DB update
    deleteTaskRowFromDB({deleteIds});
  }
  return (
    <>
      <div className='flex items-center h-[32px] pl-[15px]'>
        <h1 className='text-[15px] font-[600] '>{item?.name || 'Unknown'}</h1>
        { /* delete button */
        (checkedIds.size !== 0) &&
        <button
          type="button"
          className="
            flex items-center transition ml-auto hover:bg-red-100/80 cursor-pointer
            p-[3px] pr-[6px] rounded-[4px] box-content"
          onClick={async () => {
            try {
              await showModal({
                type: 'delete',
                title: `선택한 행을 삭제하시겠습니까? (${checkedIds.size}개 행)`
              });
              handleDeleteRow();

              return;
            } catch {
              console.log('사용자 취소');
              return;
            }
          }}
        >
          <svg className="h-[21px] w-[21px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#db0000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7l16 0" />
            <path d="M10 11l0 6" />
            <path d="M14 11l0 6" />
            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
          </svg>
          <span className='relative top-[1px] ml-[2px] text-[14px] text-[#db0000]'>Delete</span>
        </button>
        }
      </div>
      <div className="relative pl-[5px] pr-[5px] pt-[5px] w-full h-full scroll-8px mb-[60px]" style={{ overflowX: 'auto' }}>
        <table className="itemTable border-collapse w-min table-fixed">
          <thead>
            <ItemTableHeadContainer
              fields={fields} handleCheckAll={handleCheckAll} isAllChecked={isAllChecked} itemId={item.id}
            />  
          </thead>
          <tbody ref={containerRef}>
            {[...rows].sort((a, b) => (a.order) - (b.order)).map((row)  => (
              <ItemTableRow key={row.rowId} row={row} fields={fields} checkedIds={checkedIds} handleCheckbox={handleCheckbox} updateValue={updateValue} />
            ))}
            <AddRowButton fields={fields} addTaskRow={addTaskRow} />
          </tbody>
        </table>
      </div>
    </>
  );
}