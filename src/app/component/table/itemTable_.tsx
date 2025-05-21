'use client'
import { useEffect, useState, useRef } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import {
  useReactTable,
  getCoreRowModel,
  ColumnResizeMode,
  flexRender,
} from '@tanstack/react-table'
import { flash } from "@/app/animation";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import ItemTableRow from './itemTableRow';
import AddRowButton from './addRowButton';
import { moveTaskRow, addTaskToDB, updateValueToDB } from '@/app/controllers/taskController';
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/app/store/store";
import { handleFieldSelector }  from "@/app/store/tableSlice";

export default function ItemTable({fields, initialValues, itemId}: {fields: Field[], initialValues: any, itemId: number}) {
  const [values, setValues] = useState<any[]>(initialValues);
  const [columns, setColumns] = useState<any[]>([]);
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const columnHelper = createColumnHelper<any>();
  const dispatch: AppDispatch = useDispatch();

  // task (row) 추가
  const addNewTask = (name: string) => {
    const newData = values.map(el => ({ ...el }));
    const maxOrder = newData.reduce(
      (max, el) => (typeof el.order === 'number' && el.order > max ? el.order : max), 0
    );

    // 임시 rowId 생성
    const tempRowId = Date.now();
    const newRow: Record<string, any> = {
      rowId: tempRowId,
      order: maxOrder + 1,
    };

    // 'name' 타입에 name 할당
    const nameField = fields.find(f => f.type === 'name');
    fields.forEach(f => {
      newRow[f.id] = f.id === nameField?.id ? name : '';
    });

    // 상태 업데이트
    newData.push(newRow);
    setValues(newData);

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
    }).then((newTask) => {
      newRow.rowId = newTask.ID;  // 임시 id => 실제 id
      setValues([...newData]);
    });
  }

  // value update
  const updateValue = ({rowId, fieldId, value} : {rowId: number, fieldId: number, value: string}) => {
    // state
    const newData = values.map(el => ({ ...el }));
    const targetRow = newData.find((row: any) => row.rowId === rowId);
    targetRow[fieldId] = value;
    setValues(newData);

    // DB
    updateValueToDB({rowId, fieldId, value});
  }

  // drop 영역
  const containerRef = useRef<HTMLTableSectionElement>(null);

  // 초기 table field 받아오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        // fields
        if (fields) {
          setColumns([...fields].sort((a, b) => (a.order) - (b.order)).map((f) => {
            return columnHelper.accessor(f.id?.toString(), {
              header: f.name,
              size: 200,
              minSize: 100,
              maxSize: 400,
              enableResizing: true
            })
          }));
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  }, [fields]);

  const table = useReactTable({
    data: values,
    columns,
    columnResizeMode,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleCheckbox: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // 전체 check 여부
  const isAllChecked = values.length > 0 && checkedIds.size === values.length;

  // 전체 check
  const handleCheckAll = () => {
    setCheckedIds(prev => {
      if (isAllChecked) {
        return new Set(); // 전체 해제
      } else {
        return new Set(table.getRowModel().rows.map(row => row.id)); // 전체 체크
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

        // const newData = data.map((el: any) => ({ ...el }));
        const newData = [...values];
        if (updateOrder > Number(sourceData.order)) {
          // 후순서로 이동
          console.log('후순서 이동');
          // 소스 ~ 타켓 order -1
          updateOrder--; // 조정
          newData.forEach((el: any) => {
            if (el.order >= sourceData.order! && el.order <= updateOrder) {
              el.order -= 1
            }
          });
        } else {
          // 선순서로 이동
          console.log('선순서 이동');
          // 타겟 ~ 소스 order +1
          newData.forEach((el: any) => {
            if (el.order >= updateOrder && el.order <= sourceData.order!) {
              el.order += 1
            }
          });
        }
        // 대상 업데이트
        newData.find((el: any) => el.rowId === sourceData.rowId).order = updateOrder;
        console.log(newData.find((el: any) => el.rowId === sourceData.rowId))
          
        console.log('updateOrder: ', updateOrder);
        console.log('sourceData.order: ', Number(sourceData.order));
        setValues([...newData] as []);

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
  }, [values]);

  return (
    <div className="relative pl-[5px] pr-[5px] pt-[10px]" style={{ overflowX: 'auto' }}>
    <table className="itemTable border-collapse">
      <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id} className='border-b border-transparent'>
            <th>
              {/* drag button field */}
            </th>
            <th data-field="default-check" className=''>
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
            {headerGroup.headers.map(header => (
              <th
                key={header.id}
                colSpan={header.colSpan}
                className={`
                  relative
                  cursor-pointer hover:bg-gray-100
                  transition
                `}
                data-type={fields.find((f: any) => {
                    f.ID === header.id
                  })?.type || ''
                }
                style={{
                  width: header.getSize(),
                }}
              >
                <div className='flex items-center border-b border-gray-300 pl-[8px] pt-[3px] pb-[3px] text-left text-gray-500 font-[500] text-[13px] h-[32px]'>
                  <p>{flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}</p>
                </div>
                {/* 리사이즈 핸들러 */}
                {header.column.getCanResize() && (
                  <div
                      onMouseDown={(e) => {
                        header.getResizeHandler()(e);
                      }}
                      onTouchStart={(e) => {
                        header.getResizeHandler()(e);
                      }}
                      className='absolute right-0 top-0 h-full w-[8px] cursor-col-resize select-none border-r-[4px] border-transparent hover:border-blue-400 transition-all'
                  />
                )}
              </th>
            ))}
            {/* field 추가 */}
            <th className='
              text-center text-[#666]
              w-[50px]
              cursor-pointer
              hover:bg-gray-100
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
        ))}
      </thead>
      <tbody ref={containerRef}>
        {[...table.getRowModel().rows].sort((a, b) => (a.original["order"]) - (b.original["order"])).map((row)  => (
          <ItemTableRow key={row.id} row={row} checkedIds={checkedIds} handleCheckbox={handleCheckbox} updateValue={updateValue} />
        ))}
        <AddRowButton fields={fields} addNewTask={addNewTask} />
      </tbody>
    </table>
    </div>
  );
}