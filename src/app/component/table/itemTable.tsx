'use client'
import { useEffect, useState, useRef } from 'react'
import { flash } from "@/app/animation";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import ItemTableRow from './itemTableRow';
import AddRowButton from './addRowButton';
import { moveTaskRow, addTaskToDB, updateValueToDB } from '@/app/controllers/taskController';
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch } from "@/app/store/store";
import { setTableData, setValues, handleFieldSelector, setRealId } from "@/app/store/tableSlice";
import type { RootState } from "@/app/store/store";
import ItemTableHead from './itemTableHead';

export default function ItemTable({initialTableData, itemId}: {
  initialTableData: {
    rows: TaskRow[];
    fields: TaskField[];
  },
  itemId: number
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
      const el = document.querySelector(`[data-row-id="${tempRowId}"]`);
      if (el) {
        flash(el);
      }
    }, 10);

    // DB에 추가
    addTaskToDB({
      itemId: itemId,
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
  }

  // drop 영역
  const containerRef = useRef<HTMLTableSectionElement>(null);

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
        })

        // 이동 후 flash
        const element: Element | null = document.querySelector(`[data-row-id="${sourceData.rowId}"]`);
        if (element instanceof Element) {
          setTimeout(() => {
            flash(element);
          }, 10)
        }
      },
    });
  }, [rows]);
  return (
    <div className="relative pl-[5px] pr-[5px] pt-[10px] w-full h-full scroll-8px" style={{ overflowX: 'auto' }}>
    <table className="itemTable border-collapse w-max table-fixed">
      <thead>
        <tr className='border-b border-transparent'>
          <th className='w-[20px]'>
            {/* drag button field */}
          </th>
          <th data-field="default-check" className="w-[19px]">
            <span
              role="checkbox"
              tabIndex={0}
              aria-checked={isAllChecked}
              onClick={handleCheckAll}
              onKeyDown={e => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handleCheckAll();
                }
              }}
              className={`
                inline-block
                relative
                w-[14px] h-[14px]
                border rounded-[2px]
                text-center
                select-none
                cursor-pointer
                top-[-3px]
                mr-[5px]
                ${isAllChecked 
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-transparent text-transparent border-gray-400'}
              `}
            >
              <span className='block relative top-[2px] text-[9px] font-[400] leading-[100%]'>✔</span>
            </span>
          </th>
          {[...fields].sort((a, b) => (a.order) - (b.order)).map((field) => (
            <ItemTableHead key={field.fieldId} field={field} />
          ))}
          {/* field 추가 버튼 */}
          <th className='
            sticky right-[-10px]
            text-center text-[#666]
            w-[50px]
            cursor-pointer
            bg-white hover:bg-gray-100
            transition'
            onClick={() => dispatch(handleFieldSelector({itemId}))}
          >
            <div className='flex items-center pl-[14px] border-b border-gray-300 h-[32px]'>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="21" height="21" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor">
                <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"></path>
                <path d="M16.1 12h-8.5"></path>
                <path d="M12 7.8v8.7"></path>
              </svg>
            </div>
          </th>
        </tr>
      </thead>
      <tbody ref={containerRef}>
        {[...rows].sort((a, b) => (a.order) - (b.order)).map((row)  => (
          <ItemTableRow key={row.rowId} row={row} fields={fields} checkedIds={checkedIds} handleCheckbox={handleCheckbox} updateValue={updateValue} />
        ))}
        <AddRowButton fields={fields} addTaskRow={addTaskRow} />
      </tbody>
    </table>
    </div>
  );
}