import type { FieldSidebarType } from '@/global';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const tableSlice = createSlice({
  name: 'table',
  initialState: {
    fieldSidebar: {
      isOpen: false,
      itemId: 0,
      fieldType: '',
      fieldTypeId: 0,
      sidebarType: 'add' as FieldSidebarType
    },
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
        type: "row" | "field" | "dropdownOptions",
        tempId: number,
        realId: number,
        fieldTypeId?: number, // 'field'인 경우만
      }>
    ) => {
      const { type, tempId, realId, fieldTypeId } = action.payload;
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
          }
        });
      }
    },
    /* dropdown option의 temp id를 real id로 변경 */
    setDropdownOptionsId: (
      state,
      action: PayloadAction<{
        fieldTypeId: number,
        options: {[key: number]: number } // [order]: id
      }>
    ) => {
      const { fieldTypeId, options } = action.payload;
      state.data.fields.forEach((field) => {
        if (field.typeId === fieldTypeId) {
          field.dropdownOptions?.forEach((opt) => {
            console.log(options[opt.order])
            opt.id = (options[opt.order])?.toString();
          })
        }
      });
    },
    // fieldSidebar open / close
    setfieldSidebar: (
      state,
      action: PayloadAction<{ isOpen: boolean, itemId: number }>
    ) => {
      const { isOpen, itemId } = action.payload;
      state.fieldSidebar.isOpen = isOpen;
      state.fieldSidebar.itemId = itemId;
    },
    // field 추가 sidebar open/close
    handleAddFieldSidebar: (
      state,
      action: PayloadAction<{ itemId: number }>
    ) => {
      const { itemId } = action.payload;
      state.fieldSidebar.sidebarType = 'add';
      state.fieldSidebar.itemId = itemId;
      state.fieldSidebar.isOpen = !state.fieldSidebar.isOpen;
    },
    // field 수정 sidebar open/close
    handleEditFieldSidebar: (
      state,
      action: PayloadAction<{
        field: TaskField
      }>
    ) => {
      const { field } = action.payload;
      state.fieldSidebar.sidebarType = 'edit';
      state.fieldSidebar.fieldType = field.type;
      state.fieldSidebar.fieldTypeId = field.typeId;
      state.fieldSidebar.isOpen = !state.fieldSidebar.isOpen;
    },
  },
});

export const {
  setTableData,
  setValues,
  setFields,
  setRealId,
  setDropdownOptionsId,
  setfieldSidebar,
  handleAddFieldSidebar,
  handleEditFieldSidebar
} = tableSlice.actions;

export default tableSlice.reducer;