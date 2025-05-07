'use client'
import { useEffect, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'

import {
  useReactTable,
  getCoreRowModel,
  ColumnResizeMode,
  flexRender,
} from '@tanstack/react-table'
import ItemTableColumn from './itemTableColumn';

const columnHelper = createColumnHelper<any>();

export default function ItemTable({fields, values}: {fields: any, values: any}) {
  const [data, setData] = useState([])
  const [columns, setColumns] = useState<any[]>([])
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // data 받아오기
    const fetchData = async () => {
      try {
        // fields
        if (fields) {
          setColumns(fields.map((f: any) => {
            return columnHelper.accessor(f.ID.toString(), {
              header: f.NAME,
              size: 200,
              minSize: 100,
              maxSize: 400,
              enableResizing: true
            })
          }));
        }

        // values
        setData(values);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  }, [fields, values]);

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

  // 전체 선택여부
  const isAllChecked = values.length > 0 && checkedIds.size === values.length;

  // 
  const handleCheckAll = () => {
    setCheckedIds(prev => {
      if (isAllChecked) {
        return new Set(); // 전체 해제
      } else {
        return new Set(table.getRowModel().rows.map(row => row.id)); // 전체 체크
      }
    });
  };

  return (
    <div className="pl-[5px] pt-[10px]" style={{ overflowX: 'auto' }}>
    <table className="itemTable border-collapse w-full">
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
                  })?.FIELD_TYPE || ''
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
      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id} className='group hover:bg-gray-100/30 transition'>
            <td>
              <button
                className='
                  relative invisible group-hover:visible
                  top-[2px] pl-[2px] pr-[3px]
                  cursor-move hover:bg-gray-100
                  transition
                '
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" strokeWidth="1">
                  <path d="M9 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                  <path d="M9 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                  <path d="M9 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                  <path d="M15 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                  <path d="M15 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                  <path d="M15 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                </svg>
              </button>
            </td>
            <td>
              <span
                role="checkbox"
                aria-checked={checkedIds.has(row.id)}
                tabIndex={0}
                data-id={row.id}
                onClick={handleCheckbox}
                onKeyDown={e => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handleCheckbox(e as any);
                  }
                }}
                className={`
                  inline-block
                  relative
                  invisible
                  group-hover:visible
                  w-[14px] h-[14px]
                  border rounded-[2px]
                  text-center
                  select-none
                  cursor-pointer
                  top-[-3px]
                  mr-[5px]
                  ${checkedIds.has(row.id)
                    ? 'bg-blue-500 text-white border-blue-500 visible'
                    : 'bg-transparent text-transparent border-gray-400'}
                `}
              >
                <span className='block relative top-[2px] text-[9px] font-[400] leading-[100%]'>✔</span>
              </span>
            </td>
            {row.getVisibleCells().map(cell => (
              <td
                onClick={() => console.log(cell.id)}
                key={cell.id}
                className={`border-bottom border-gray-300`}
                style={{
                  width: cell.column.getSize(),
                }}
              >
                <ItemTableColumn cell={cell}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </ItemTableColumn>
              </td>
            ))}
            <td></td>
          </tr>
        ))}
        <tr>
          <td>{/* default field */}</td>
          <td>{/* default field */}</td>
          <td>
            <button className='
              flex items-center
              border border-gray-300 rounded-[3px]
              hover:border-gray-400
              pt-[1px] pb-[1px] pr-[6px] pl-[3px]
              mt-[3px]
              transition
              cursor-pointer
              group
            '>
              <span>
                <svg className='text-[#777777] group-hover:text-[#555555]' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="17" height="17" strokeWidth="1.5">
                  <path d="M12 5l0 14"></path>
                  <path d="M5 12l14 0"></path>
                </svg>
              </span>
              <span className='text-[13px] text-gray-500 font-[400] ml-[3px] group-hover:text-gray-700'>Add Task</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    </div>
  );
}