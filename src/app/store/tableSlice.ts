import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const tableSlice = createSlice({
  name: 'table',
  initialState: {
    fieldSelector: {
      isOpen: false,
      itemId: 0
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
    // fieldSelector open / close
    setFieldSelector: (
      state,
      action: PayloadAction<{ isOpen: boolean, itemId: number }>
    ) => {
      const { isOpen, itemId } = action.payload;
      state.fieldSelector.isOpen = isOpen;
      state.fieldSelector.itemId = itemId;
    },
    // fieldSelector isOpen 반대값으로 변경
    handleFieldSelector: (
      state,
      action: PayloadAction<{ itemId: number }>
    ) => {
      const { itemId } = action.payload;
      state.fieldSelector.itemId = itemId;
      state.fieldSelector.isOpen = !state.fieldSelector.isOpen;
    },
  },
});

export const {
  setTableData,
  setValues,
  setFields,
  setRealId,
  setDropdownOptionsId,
  setFieldSelector,
  handleFieldSelector
} = tableSlice.actions;

export default tableSlice.reducer;