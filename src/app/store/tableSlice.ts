import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const tableSlice = createSlice({
  name: 'table',
  initialState: {
    data: {
      rows : [] as TaskRow[],
      fields : [] as TaskField[]
    }
  },
  reducers: {
    // table data 초기값 설정
    setTableData: (
      state,
      action: PayloadAction<{ initialTableData : { rows: TaskRow[], fields: TaskField[] } }>
    ) => {
      const { initialTableData } = action.payload;
      state.data.rows = initialTableData.rows;
      state.data.fields = initialTableData.fields;
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
        type: "row" | "field",
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
} = tableSlice.actions;

export default tableSlice.reducer;