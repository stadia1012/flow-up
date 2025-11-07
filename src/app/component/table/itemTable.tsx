'use client'
import { useEffect, useState, useRef } from 'react'
import { flash } from "@/app/animation";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import ItemTableRow from './itemTableRow';
import AddRowButton from './addRowButton';
import { moveTaskRow, addTaskRowToDB, updateValueToDB, deleteTaskRowFromDB, duplicateTaskRowsFromDB } from '@/app/controllers/taskController';
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch } from "@/app/store/store";
import { setTableData, setValues, setRealId, setSubRow, setRowOrder, setSubRowOrder, setSubRowId } from "@/app/store/tableSlice";
import type { RootState } from "@/app/store/store";
import ItemTableHeadContainer from './itemTableHeadContainer';
import { showModal } from '../modalUtils';
import { useToast } from '@/app/context/ToastContext';

export default function ItemTable({initialTableData, itemId}: {
  initialTableData: {
    rows: TaskRow[];
    fields: TaskField[];
    allTags: RowTag[];
  },
  itemId: number
}) {
  const dispatch: AppDispatch = useDispatch();
  // server에서 받은 projects를 redux에 반영
  useEffect(() => {
    dispatch(setTableData({
      initialTableData: initialTableData
    }));
  }, [initialTableData]);
  const [isLoading, setIsLoading] = useState(true);

  const [project, setProject] = useState<List|null>(null);
  const [folder, setFolder] = useState<List|null>(null);
  const [item, setItem] = useState<List|null>(null);

  const projectList = useSelector((state: RootState) =>
    state.projects.projects
  ) as List[];

  // 상단 경로 표시를 위한 초기화
  useEffect(() => {
    // project
    const foundProject = projectList
        .find(project =>
          project.lists?.some(folder => 
            folder.lists?.some(item => item.id === Number(itemId))
          ));
    if (foundProject) setProject(foundProject);

    // folder
    const foundFolder = foundProject?.lists
      ?.find(folder => folder.lists?.some(item => item.id === Number(itemId)));
    if (foundFolder) setFolder(foundFolder);
    
    // item
    const foundItem = foundFolder?.lists?.find(item => item.id === Number(itemId));
    if (foundItem ) setItem(foundItem);

    setIsLoading(false);
  }, [projectList, itemId])

  const {rows, fields, allTags} = useSelector((state: RootState) =>
    state.table.data!
  )
  
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());

  const {showToast} = useToast();

  /* task (row) 추가 */
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
      parentId: null,
      level:  0,
      order: maxOrder + 1,
      tagIds: []
    };

    // 'name' 타입에 name 값 할당
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
      itemId,
      fieldId: nameField?.fieldId || 0,
      name
    }).then((res) => {
      dispatch(setRealId({type: 'row', tempId: tempRowId, realId: res.ID}));
    });
  }

  /* value update */
  const updateValue = ({
    row, fieldId, value
  } : {
    row: TaskRow, fieldId: number, value: string
  }) => {
    // state update
    if (row.level === 0) {
      // 최상위 row의 경우
      const newRows = structuredClone(rows); // 깊은 복사
      // 타겟 row
      const targetRow = newRows.find((r: TaskRow) => r.rowId === row.rowId);
      if (!targetRow) return;
      targetRow.values[fieldId] = value;
      dispatch(setValues({
        newRows: [...newRows]
      }));
    } else {
      // sub row의 경우
      const newRows = structuredClone(rows); // 깊은 복사
      // 부모 row의 subRows
      const newSubRows = newRows.find(r => r.rowId === row.parentId)?.subRows;
      if (!newSubRows) return;
      // 타겟 row
      const targetRow = newSubRows.find(r => r.rowId === row.rowId);
      if (!targetRow || !row.parentId) return;
      targetRow.values[fieldId] = value;
      
      dispatch(setSubRow({
        parentRowId: row.parentId,
        newSubRows: [...newSubRows]
      }));
    }

    // DB update
    updateValueToDB({rowId: row.rowId, fieldId, value});
    console.log(row.rowId,',', fieldId,',', value)
  }

  // row check
  const handleCheckbox: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    const id = Number(e.currentTarget.dataset.id);
    if (!id) return;
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id); // 상태 반전
      return next;
    });
  };

  // 전체 row check 여부
  const isAllChecked = rows.length > 0 && checkedIds.size === rows.length;

  // 전체 check
  const handleCheckAll = () => {
    setCheckedIds(() => {
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

        if (sourceData.level !== targetData.level) return;
        
        console.log(`target:`, target);
        console.log(`source:`, source);

        const sourceOrder = Number(sourceData.order)
        const targetOrder = Number(targetData.order);
        const closestEdge = extractClosestEdge(targetData);
        let updateOrder = closestEdge === "top" ? targetOrder : targetOrder + 1;
          
        console.log('updateOrder: ', updateOrder);
        console.log('sourceOrder: ', sourceOrder);

        // state 변경
        if (sourceData.level === 0) {
          // 최상위 row인 경우
          dispatch(setRowOrder({
            sourceRowId: Number(sourceData.rowId),
            sourceOrder,
            updateOrder,
          }));
        } else {
          // sub row인 경우
          dispatch(setSubRowOrder({
            parentRowId: Number(sourceData.parentId) || 0,
            sourceRowId: Number(sourceData.rowId),
            sourceOrder,
            updateOrder,
          }));
        }
        
        // DB 변경
        moveTaskRow({
          rowId: Number(sourceData.rowId),
          sourceOrder: sourceOrder,
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
    // state update
    const newRows = rows.map((el: any) => ({ ...el }))
      .filter((row) => !deleteIds.includes(row.rowId));
    dispatch(setValues({newRows: [...newRows]}));

    setCheckedIds(() => {
      return new Set();
    });

    // DB update
    deleteTaskRowFromDB({deleteIds});
  }

  /* row 복제 (start) */
  const handleDuplicateRows = async () => {
    const duplicateIds = Array.from(checkedIds);
    
    if (duplicateIds.length === 0) {
      return;
    }

    // 복제할 원본 rows 찾기
    const rowsToDuplicate = rows.filter(r => duplicateIds.includes(r.rowId));

    // max order 구하기
    const maxOrder = rows.reduce(
      (max, el) => (typeof el.order === 'number' && el.order > max ? el.order : max), 
      0
    );

    let currentMaxOrder = maxOrder;
    const newRows: TaskRow[] = rows.map(el => ({ 
      ...el, 
      values: {...el.values},
      subRows: el.subRows ? el.subRows.map(sr => ({...sr, values: {...sr.values}})) : undefined
    }));
    
    type TempIdMapping = {
      parentTempId: number;
      subRowTempIds: Map<number, number>;
    };
    const tempIdMap = new Map<number, TempIdMapping>();

    // 각 row 복제
    rowsToDuplicate.forEach((originalRow) => {
      // 부모 row 복제
      const parentTempId = Date.now() + Math.random();
      
      const newParentRow: TaskRow = {
        values: { ...originalRow.values },
        rowId: parentTempId,
        parentId: null, // 최상위 레벨이므로 null
        level: 0, // 최상위 레벨
        order: ++currentMaxOrder,
        tagIds: [...originalRow.tagIds],
      };

      // subrow 임시 ID 맵
      const subRowTempIds = new Map<number, number>();

      // 하위 rows 복제
      if (originalRow.subRows && originalRow.subRows.length > 0) {
        newParentRow.subRows = [];
        
        originalRow.subRows.forEach(subRow => {
          const subRowTempId = Date.now() + Math.random();
          
          const newSubRow = {
            values: { ...subRow.values },
            rowId: subRowTempId,
            parentId: parentTempId,
            level: 1, // subrow는 레벨 1
            order: subRow.order,
            tagIds: [...subRow.tagIds]
          };

          subRowTempIds.set(subRow.rowId, subRowTempId);
          newParentRow.subRows!.push(newSubRow);
        });
      }

      tempIdMap.set(originalRow.rowId, { 
        parentTempId, 
        subRowTempIds 
      });

      newRows.push(newParentRow);
    });

    // state 업데이트
    dispatch(setValues({newRows: [...newRows]}));

    // 체크 해제
    setCheckedIds(new Set());

    // flash 효과
    setTimeout(() => {
      tempIdMap.forEach(({ parentTempId, subRowTempIds }) => {
        // 부모 row flash
        const parentEl = document.querySelectorAll(`[data-row-id="${parentTempId}"] td`);
        if (parentEl) {
          parentEl.forEach(td => flash(td));
        }
        
        // subrow flash
        subRowTempIds.forEach((subRowTempId) => {
          const subEl = document.querySelectorAll(`[data-row-id="${subRowTempId}"] td`);
          if (subEl) {
            subEl.forEach(td => flash(td));
          }
        });
      });
    }, 10);

    // DB에 복제
    try {
      const res = await duplicateTaskRowsFromDB({
        itemId,
        duplicateIds
      });

      if (res.success && 'rowMapping' in res) {
        // 임시 ID를 실제 ID로 교체
        res.rowMapping.forEach((mapping: any) => {
          const tempMapping = tempIdMap.get(mapping.originalId);
          if (!tempMapping) return;

          // 부모 row ID 교체
          dispatch(setRealId({
            type: 'row', 
            tempId: tempMapping.parentTempId, 
            realId: mapping.newId
          }));

          // subrow ID 교체
          mapping.subRows.forEach((subRowMapping: any) => {
            const subRowTempId = tempMapping.subRowTempIds.get(subRowMapping.originalId);
            if (subRowTempId) {
              dispatch(setSubRowId({
                parentRowId: mapping.newId,
                tempId: subRowTempId,
                realId: subRowMapping.newId
              }));
            }
          });
        });
      }
    } catch (error) {
      console.error('Row 복제 실패:', error);
    }
  };
  /* row 복제 (end) */
  return (
    <div className='flex flex-col p-[15px] pt-[20px] pl-[10px] overflow-hidden w-full h-full min-w-[400px]'>
      <div className='pl-[15px]'>
        <div className='flex text-[13.5px] text-gray-500 mb-[10px] font-[400]'>
          <span className='inline-flex items-center'>{
            isLoading
             ? <span className='block animate-pulse bg-gray-300 rounded h-[16px] w-[70px]'></span>
             : <span>{project?.name || ''}</span>
          }</span>
          <span className='inline-block ml-[9px] mr-[9px]'>/</span>
          <span className='inline-flex items-center'>{
            isLoading
             ? <span className='block animate-pulse bg-gray-300 rounded h-[16px] w-[70px]'></span>
             : <span>{folder?.name || ''}</span>
          }</span>
          <span className='inline-block ml-[9px] mr-[9px]'>/</span>
          <span className='inline-flex items-center'>{
            isLoading
             ? <span className='block animate-pulse bg-gray-300 rounded h-[16px] w-[70px]'></span>
             : <span>{item?.name || ''}</span>
          }</span>
        </div>
      </div>
      <div className='flex items-center h-[32px] pl-[15px]'>
        <div className='flex items-center'>
          <h1 className='text-[15px] font-[600] '>{
            isLoading
              ? <span className='block animate-pulse bg-gray-300 rounded h-[17px] w-[90px]'></span>
              : item?.name || ''
          }</h1>
          <p className='ml-[7px] text-[14px] text-gray-500/90 font-[500]'>
          {
            checkedIds.size
              ? `(${checkedIds.size}/${rows.length})`
              : `(${rows.length})`
          }
          </p>
        </div>
        { (checkedIds.size !== 0) &&
        <div className='flex'>
          {/* duplicate button */}
          <button
            type="button"
            className="
              flex items-center transition ml-[12px] mr-[5px] hover:bg-gray-100 cursor-pointer
              p-[2px] pr-[7px] pl-[4px] rounded-[4px] box-content border border-gray-400 rounded-[4px]"
            onClick={async () => {
              try {
                await showModal({
                  type: 'confirm',
                  title: `선택한 행을 복제하시겠습니까? (${checkedIds.size}개 행)`,
                  buttonText: {confirm: '확인'}
                });
                handleDuplicateRows(); 
                showToast('복제되었습니다.', 'success');
                return;
              } catch {
                console.log('사용자 취소');
                return;
              }
            }}
          >
            <svg className="h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#222222" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
              <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
            </svg>
            <span className='relative top-[1px] ml-[2px] text-[13px] text-[#222222]'>Duplicate</span>
          </button>
          {/* delete button */}
          <button
            type="button"
            className="
              flex items-center transition mr-[10px] hover:bg-red-100/60 cursor-pointer
              p-[2px] pr-[7px] pl-[4px] rounded-[4px] box-content border border-red-300 rounded-[4px]"
            onClick={async () => {
              try {
                await showModal({
                  type: 'delete',
                  title: `선택한 행을 삭제하시겠습니까? (${checkedIds.size}개 행)`
                });
                handleDeleteRow();
                showToast('삭제되었습니다.', 'success');
                return;
              } catch {
                console.log('사용자 취소');
                return;
              }
            }}
          >
            <svg className="h-[18px] w-[18px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#db0000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7l16 0" />
              <path d="M10 11l0 6" />
              <path d="M14 11l0 6" />
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
            </svg>
            <span className='relative top-[1px] ml-[2px] text-[13px] text-[#db0000]'>Delete</span>
          </button>
        </div>
        }
      </div>
      <div className="relative pl-[0px] pr-[5px] pt-[0px] w-full h-full scroll-8px mb-[0px] mr-[8px] pb-[15px]" style={{ overflowX: 'auto', overflowY: 'auto' }}>
        <table className="itemTable border-collapse w-min table-fixed">
          <thead>
            <ItemTableHeadContainer
              fields={fields} handleCheckAll={handleCheckAll} isAllChecked={isAllChecked} itemId={itemId}
            />  
          </thead>
          <tbody ref={containerRef}>
            {[...rows].sort((a, b) => (a.order) - (b.order)).map((row)  => (
              <ItemTableRow
                key={row.rowId}
                itemId={itemId}
                row={row}
                rows={rows}
                fields={fields}
                checkedIds={checkedIds}
                handleCheckbox={handleCheckbox}
                updateValue={updateValue}
                allTags={allTags}
              />
            ))}
            <AddRowButton fields={fields} addTaskRow={addTaskRow} />
          </tbody>
        </table>
      </div>
    </div>
  );
}