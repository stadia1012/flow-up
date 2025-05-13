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
import { moveTaskRow, addTaskToDB } from '@/app/controllers/taskController';

export default function ItemTable({fields, initialData, itemId}: {fields: Field[], initialData: any, itemId: number}) {
  const [data, setData] = useState<any[]>(initialData);
  const [columns, setColumns] = useState<any[]>([]);
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const columnHelper = createColumnHelper<any>();

  const addNewTask = (name: string) => {
    const newData = data.map(el => ({ ...el }));

    // 1. 최대 order 계산
    const maxOrder = newData.reduce(
      (max, el) => (typeof el.order === 'number' && el.order > max ? el.order : max),
      0
    );

    // 2. 임시 rowId 생성
    const tempRowId = Date.now();

    // 3. 새 행 객체 생성
    const newRow: Record<string, any> = {
      rowId: tempRowId,
      order: maxOrder + 1,
    };
    // 'name' 타입에 name 할당
    const nameField = fields.find(f => f.type === 'name');
    fields.forEach(f => {
      newRow[f.id] = f.id === nameField?.id ? name : '';
    });

    // 4. 상태 업데이트
    newData.push(newRow);
    setData(newData);

    // 5. 새로 추가된 행에 플래시 애니메이션 적용
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
      newRow.rowId = newTask.ID;
      setData([...newData]);
    });
  }

  // drop 영역
  const containerRef = useRef<HTMLTableSectionElement>(null);

  // 초기 table field 받아오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        // fields
        if (fields) {
          setColumns(fields.map((f) => {
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
    data,
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
  const isAllChecked = data.length > 0 && checkedIds.size === data.length;

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
        const newData = [...data];
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
        setData([...newData] as []);

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
  }, [data, data]);

  return (
    <div className="relative pl-[5px] pt-[10px]" style={{ overflowX: 'auto' }}>
    <table className="itemTable border-collapse">
      <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id} className='group'>
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
                  text-left text-gray-600 font-[400]
                  pl-[8px] pt-[3px] pb-[3px]
                  border-t border-b border-gray-300
                  cursor-pointer
                  hover:bg-gray-100
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
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
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
            <th className='
              text-center text-[#666]
              w-[50px]
              pl-[14px]
              border-t border-b border-gray-300
              cursor-pointer
              hover:bg-gray-100
              transition'
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="21" height="21" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor">
                <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"></path>
                <path d="M16.1 12h-8.5"></path>
                <path d="M12 7.8v8.7"></path>
              </svg>
            </th>
          </tr>
        ))}
      </thead>
      <tbody ref={containerRef}>
        {[...table.getRowModel().rows].sort((a, b) => (a.original["order"]) - (b.original["order"])).map((row)  => (
          <ItemTableRow key={row.id} row={row} checkedIds={checkedIds} handleCheckbox={handleCheckbox} />
        ))}
        <AddRowButton fields={fields} addNewTask={addNewTask} />
      </tbody>
    </table>
    </div>
  );
}