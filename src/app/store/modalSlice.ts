import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReactNode } from 'react';

// 초기값
const initialState: Modal = {
  type: 'alert',
  title: '확인하시겠습니까?',
  description: undefined,
  buttonText: {
    confirm: '확인',
    cancel: '취소',
  },
  isOpen: false,
  onConfirm: undefined,
  onCancel: undefined,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    // modal 열기
    openModal: (
      _state,
      action: PayloadAction<{
        type: "confirm" | "delete" | "alert";
        title: ReactNode;
        description?: ReactNode;
        buttonText?: {
          confirm: string;
          cancel: string;
        },
        onConfirm?: () => void;
        onCancel?: () => void;
      }>
    ) => {
      const { type, title, description, buttonText, onConfirm, onCancel }  = action.payload;
      return {
        ...initialState, // 초기화
        type,
        title,
        description,
        buttonText: buttonText ?? initialState.buttonText,
        onConfirm,
        onCancel,
        isOpen: true,
      };
    },
    
  },
});

export const {
  openModal,
  // closeModal,
} = modalSlice.actions;

export default modalSlice.reducer;