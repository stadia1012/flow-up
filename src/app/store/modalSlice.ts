import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReactNode, ComponentType } from 'react';

// 초기값
// const initialState: ModalState = {
//   type: 'alert',
//   title: '확인하시겠습니까?',
//   description: undefined,
//   buttonText: {
//     confirm: '확인',
//     cancel: '취소',
//   },
//   isOpen: false,
//   onConfirm: undefined,
//   onCancel: undefined,
// };

export interface ModalState {
  isOpen: boolean;
  component: ComponentType<any> | null;
  props: ModalProps | {};
}

const initialState: ModalState = {
  isOpen: false,
  component: null,
  props: {} as ModalProps,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    // modal 열기
    openModal: (
      state,
      action: PayloadAction<{
        component: ComponentType<any>;
        props?: ModalProps;
      }>
    ) => {
      const { component, props } = action.payload;
      state.isOpen = true;
      state.component = component;
      state.props = props ?? {};
    },
    // modal 닫기
    closeModal: (state) => {
      state.isOpen = false;
      state.component = null;
      state.props = {};
    },
  },
});

export const {
  openModal,
  closeModal,
} = modalSlice.actions;

export default modalSlice.reducer;