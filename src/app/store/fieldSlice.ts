import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const fieldSlice = createSlice({
  name: 'field',
  initialState: {
    fieldSelector: {
      isOpen: false,
      itemId: 0
    }
  },
  reducers: {
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
    }
  },
});

export const {
  setFieldSelector,
  handleFieldSelector
} = fieldSlice.actions;

export default fieldSlice.reducer;