import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const tableSlice = createSlice({
  name: 'table',
  initialState: {
    data: {
      rows: [] as TaskRow[],
      fields: [] as TaskField[],
      allTags: [] as RowTag[] 
    }
  },
  reducers: {
    // table data 초기값 설정
    setTableData: (
      state,
      action: PayloadAction<{ initialTableData : { rows: TaskRow[], fields: TaskField[], allTags: RowTag[] } }>
    ) => {
      const { initialTableData } = action.payload;
      state.data.rows = initialTableData.rows;
      state.data.fields = initialTableData.fields;
      state.data.allTags = initialTableData.allTags;
    },
    /* table data 설정 */
    setValues: (
      state,
      action: PayloadAction<{ newRows: TaskRow[] }>
    ) => {
      const { newRows } = action.payload;
      state.data.rows = newRows;
    },
    /* table fields 설정 (field 추가 시 temp id 입력) */
    setFields: (
      state,
      action: PayloadAction<{ newFields: TaskField[] }>
    ) => {
      const { newFields } = action.payload;
      state.data.fields = newFields;
    },
    /* temp id를 real id로 변경 */
    setRealId: (
      state,
      action: PayloadAction<{
        type: "row" | "field" | "tag",
        tempId: number,
        realId: number,
        fieldTypeId?: number, // 'field'인 경우만
        canEdit?: boolean // 'field'인 경우만
      }>
    ) => {
      const { type, tempId, realId, fieldTypeId, canEdit } = action.payload;
      if (type === "row") {
        state.data.rows.forEach((row) => {
          if (row.rowId === tempId) {
            row.rowId = realId;
          }
        });
      }
      else if (type === "field" && fieldTypeId) {
        state.data.fields.forEach((field) => {
          if (field.fieldId === tempId) {
            field.fieldId = realId;
            field.typeId = fieldTypeId;
            if (canEdit) {
              field.canEdit = canEdit
            }
          }
        });
      } else if (type === "tag" && realId) {
        state.data.allTags.forEach((tag) => {
          if (tag.id === tempId) {
            tag.id = realId;
          }
        });
      }
    },
    /* temp id를 real id로 변경 */
    setSubRowId: (
      state,
      action: PayloadAction<{
        parentRowId: number,
        tempId: number,
        realId: number
      }>
    ) => {
      const { parentRowId, tempId, realId } = action.payload;
      const parentRow = state.data.rows.find(
        (row) => row.rowId === parentRowId
      );
      if (!parentRow?.subRows) return;

      const subRow = parentRow.subRows.find(
        (sr) => sr.rowId === tempId
      );
      if (subRow) {
        subRow.rowId = realId;
      }
    },
    /* dropdown option의 temp id를 real id로 변경 */
    setDropdownOptionsId: (
      state,
      action: PayloadAction<{
        fieldTypeId: number,
        options: {[key: string]: number } // [tempId]: realId
      }>
    ) => {
      const { fieldTypeId, options } = action.payload;
      state.data.fields.forEach((field) => {
        if (field.typeId === fieldTypeId) {
          field.dropdownOptions?.forEach((opt) => {
            if ( Object.keys(options).includes(opt.id) ) {
              opt.id = (options[opt.id])?.toString() || '0';
            }
          })
        }
      });
    },
    /* sub row 추가/삭제/업데이트 */
    setSubRow: (
      state,
      action: PayloadAction<{
        parentRowId: number,
        newSubRows: TaskRow[],
      }>
    ) => {
      const { parentRowId, newSubRows } = action.payload;
      state.data.rows.forEach(row => {
        if (row.rowId === parentRowId) {
          row.subRows = newSubRows;
        }
      })
    },
    /* row order 변경 */
    setRowOrder: (
      state,
      action: PayloadAction<{
        sourceRowId: number, // 대상 row
        sourceOrder: number, // 변경 전 order
        updateOrder: number, // 변경 후 order
      }>
    ) => {
      const { sourceRowId, sourceOrder, updateOrder } = action.payload;
      let updateOrder_ = updateOrder;
      if (updateOrder > sourceOrder) {
        // 후순서로 이동
        console.log('후순서 이동');
        updateOrder_--; // 조정
        state.data.rows.forEach((row) => {
          // 소스 ~ 타켓 사이 row들의 order -= 1
          if (row.order >= sourceOrder! && row.order <= updateOrder) {
            row.order -= 1
          }
          // 대상 row order 변경
          if (row.rowId === sourceRowId) {
            row.order = updateOrder_;
          }
        });
      } else {
        // 선순서로 이동
        console.log('선순서 이동');
        state.data.rows.forEach((row) => {
          // 타겟 ~ 소스 사이 row들의 order += 1
          if (row.order >= updateOrder_ && row.order <= sourceOrder!) {
            row.order += 1
          }
          // 대상 row order 변경
          if (row.rowId === sourceRowId) {
            row.order = updateOrder_;
          }
        });
      }
    },
    /* sub row order 변경 */
    setSubRowOrder: (
      state,
      action: PayloadAction<{
        parentRowId: number,
        sourceRowId: number, // 대상 row
        sourceOrder: number, // 변경 전 order
        updateOrder: number, // 변경 후 order
      }>
    ) => {
      const { parentRowId, sourceRowId, sourceOrder, updateOrder } = action.payload;
      let parentRow = state.data.rows.find(r => r.rowId === parentRowId);
      let updateOrder_ = updateOrder;
      if (!parentRow) return;
      if (updateOrder > sourceOrder) {
        // 후순서로 이동
        console.log('후순서 이동');
        updateOrder_--; // 조정
        parentRow?.subRows?.forEach((row) => {
          // 소스 ~ 타켓 사이 row들의 order -= 1
          if (row.order >= sourceOrder! && row.order <= updateOrder) {
            row.order -= 1
          }
          // 대상 row order 변경
          if (row.rowId === sourceRowId) {
            row.order = updateOrder_;
          }
        });
      } else {
        // 선순서로 이동
        console.log('선순서 이동');
        parentRow?.subRows?.forEach((row) => {
          // 타겟 ~ 소스 사이 row들의 order += 1
          if (row.order >= updateOrder_ && row.order <= sourceOrder) {
            row.order += 1
          }
          // 대상 row order 변경
          if (row.rowId === sourceRowId) {
            row.order = updateOrder_;
          }
        });
      }
    },
    /* 신규 tag 추가 */
    addAllTags: (
      state,
      action: PayloadAction<{
        tempId: number
        name: string,
      }>
    ) => {
      const { tempId, name } = action.payload;
      state.data.allTags.push({
        id: tempId,
        name: name,
        color: 'cccccc'
      })
    },
    /* tag를 row에 추가 */
    addTagToRow: (
      state,
      action: PayloadAction<{
        rowId: number
        tagId: number,
      }>
    ) => {
      const { rowId, tagId } = action.payload;
      state.data.rows.flatMap(row => [row, ...(row.subRows || [])]).forEach((row) => {
        if (row.rowId === rowId && !row.tagIds.includes(tagId)) {
          row.tagIds.push(tagId);
        }
      })
    },
    /* tag를 row에서 제거 */
    deleteRowTag: (
      state,
      action: PayloadAction<{
        rowId: number
        tagId: number,
      }>
    ) => {
      const { rowId, tagId } = action.payload;
      const row = state.data.rows.flatMap(r => [r, ...(r.subRows || [])]).find(row => (
        row.rowId === rowId
      ));

      if (row) {
        row.tagIds = row.tagIds.filter((id: number) => id !== tagId);
      }
    },
    /* tag를 완전히 제거 */
    deleteTag: (
      state,
      action: PayloadAction<{
        tagId: number,
      }>
    ) => {
      const { tagId } = action.payload;
      // 전체 row에서 tag 제거
      state.data.rows.forEach(row => {
        row.tagIds = row.tagIds.filter((id: number) => id !== tagId);
      });

      // allTags에서 제거
      state.data.allTags = state.data.allTags.filter((row: RowTag) => row.id !== tagId);
    },
    /* tag 수정 */
    editTag: (
      state,
      action: PayloadAction<{
        tagId: number,
        color: string,
        name: string
      }>
    ) => {
      const { tagId, color, name } = action.payload;
      // tag 찾기
      const tag = state.data.allTags.find(tag => tag.id === tagId);

      // tag 수정
      if (tag) {
        tag.color = color;
        tag.name = name;
      }
    },
  },
});

export const {
  setTableData,
  setValues,
  setFields,
  setRealId,
  setSubRowId,
  setDropdownOptionsId,
  setSubRow,
  setRowOrder,
  setSubRowOrder,
  addAllTags,
  addTagToRow,
  deleteRowTag,
  deleteTag,
  editTag
} = tableSlice.actions;

export default tableSlice.reducer;