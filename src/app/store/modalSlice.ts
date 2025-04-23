import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReactNode } from 'react';

const modalSlice = createSlice({
  name: 'modal',
  initialState: {
    type: "confirm",
    title: "확인하시겠습니까?",
    isOpen: false,
    buttonText : {
      apply: "확인",
      close: "취소"
    }
  },
  reducers: {
    // modal 열기
    openModal: (
      state,
      action: PayloadAction<{
        title: ReactNode;
        description: ReactNode;
        index?: number
      }>
    ) => {
      const {  }  = action.payload;
    },
    // modal 닫기
    closeModal: (
      state,
      action: PayloadAction<{ projectId: number; folder: List; index?: number }>
    ) => {
      const { projectId, folder, index }  = action.payload;
    },
  },
});

export const {
  openModal,
  closeModal,
} = modalSlice.actions;

export default modalSlice.reducer;