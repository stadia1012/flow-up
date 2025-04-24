import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { openModal } from '@/app/store/modalSlice';
import DefaultModal from '@/app/component/defaultModal';

export function useModal() {
  const dispatch = useDispatch();

  return useCallback(
    ({ props }: { props: ModalProps }): Promise<void> => {
      return new Promise((resolve, reject) => {
        dispatch(
          openModal({
            component: DefaultModal,
            props: {
              type: props.type,
              title: props.title,
              description: props.description,
              buttonText: {
                confirm: props.buttonText?.confirm || '확인',
                cancel: props.buttonText?.cancel || '취소',
              },
              onConfirm: resolve,
              onCancel: reject,
            } as ModalProps,
          }),
        );
      });
    },
    [dispatch],
  );
}