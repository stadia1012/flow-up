'use client'
import { useEffect, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { getItemValues } from '@/app/controllers/projectController';
import {
  useReactTable,
  getCoreRowModel,
  ColumnResizeMode,
  flexRender,
} from '@tanstack/react-table'

const defaultData = [
  { 1: 'John',  2: 'Doe',    3: 28 },
  { 1: 'Jane',  2: 'Smith',  3: 34 },
  { 1: 'Alice', 2: 'Johnson', 3: 23 },
]
const columnHelper = createColumnHelper<any>();

const fff = [{id: 1, name: 'firstName'},
  {id: 2, name: 'lastName'},
  {id: 3, name: 'age'}
];

export default function MainTable() {
  const [data, setData] = useState(() => [...defaultData])
  const [columns, setColumns] = useState<any[]>([])
  const [columnResizeMode, setColumnResizeMode] =
  useState<ColumnResizeMode>('onChange');
  
  useEffect(() => {
    // data 받아오기
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/values/1`);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();

        // fields
        if (data.fields) {
          setColumns(data.fields.map((f: any) => {
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
        setData(data.values);
        
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  }, []);

  const table = useReactTable({
    data,
    columns,
    columnResizeMode,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div style={{ overflowX: 'auto' }}>
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th
                key={header.id}
                colSpan={header.colSpan}
                style={{
                  border: '1px solid #ccc',
                  position: 'relative',
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
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td
                key={cell.id}
                style={{
                  border: '1px solid #eee',
                  padding: '4px 8px',
                  width: cell.column.getSize(),
                }}
              >
                {flexRender(
                  cell.column.columnDef.cell,
                  cell.getContext()
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  );
}