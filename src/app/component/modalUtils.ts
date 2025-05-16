'use client';
import { createRoot } from 'react-dom/client';
import DefaultModal, { ModalProps } from '@/app/component/defaultModal';

export const showModal = (props: ModalProps): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 모달을 렌더링할 DOM 요소 생성
    const modalRoot = document.createElement('div');
    document.body.appendChild(modalRoot);

    const root = createRoot(modalRoot);

    // 확인 핸들러
    const handleConfirm = () => {
      resolve();
      cleanup();
    };

    // 취소 핸들러
    const handleCancel = () => {
      reject();
      cleanup();
    };

    // 모달 제거 및 정리
    const cleanup = () => {
      root.unmount();
      document.body.removeChild(modalRoot);
    };

    // 모달 props 구성
    const modalProps: ModalProps = {
      ...props,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    };

    // React Portal로 모달 렌더링
    root.render( DefaultModal(modalProps) as React.ReactElement<ModalProps> );

    requestAnimationFrame(() => {
      if (props.type === "alert") {
        document.getElementById("default-modal-cancel")?.focus();
      }
    });
  });
};