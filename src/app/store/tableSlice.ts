import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const tableSlice = createSlice({
  name: 'table',
  initialState: {
    fieldSelector: {
      isOpen: false,
      itemId: 0
    },
    data: {
      values : [] as TaskRow[],
      fields : [] as TaskField[]
    }
  },
  reducers: {
    // table data 초기값 설정
    setTableData: (
      state,
      action: PayloadAction<{ initialTableData : { values: TaskRow[], fields: TaskField[] } }>
    ) => {
      const { initialTableData } = action.payload;
      state.data.values = initialTableData.values;
      state.data.fields = initialTableData.fields;
    },
    // table data 설정
    setValues: (
      state,
      action: PayloadAction<{ newValues: TaskRow[] }>
    ) => {
      const { newValues } = action.payload;
      state.data.values = newValues;
    },
    // table fields 설정
    setFields: (
      state,
      action: PayloadAction<{ newFields: TaskField[] }>
    ) => {
      const { newFields } = action.payload;
      state.data.fields = newFields;
    },
    // temp id를 real id로 변경
    setRealId: (
      state,
      action: PayloadAction<{ type: "row" | "field", tempId: number, realId: number }>
    ) => {
      const { type, tempId, realId } = action.payload;
      if (type === "row") {
        state.data.values.forEach((row) => {
          if (row.rowId === tempId) {
            row.rowId = realId;
          }
        });
      }
      else if (type === "field") {
        state.data.fields.forEach((field) => {
          if (field.fieldId === tempId) {
            field.fieldId = realId;
          }
        });
      }
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
    // field 추가 시 임시 값 추가하고 추후 DB 값으로 변경함
    addField: (
      state,
      action: PayloadAction<{ fieldId: number, name: string, type: string }>
    ) => {
      const { fieldId, name, type } = action.payload;
      state.data.fields.push({
        fieldId: fieldId,
        name: name,
        type: type,
        order: 1,
        width: 200
      });
    },
  },
});

export const {
  setTableData,
  setValues,
  setFields,
  setRealId,
  setFieldSelector,
  handleFieldSelector
} = tableSlice.actions;

export default tableSlice.reducer;