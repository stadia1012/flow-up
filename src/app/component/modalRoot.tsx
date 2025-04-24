'use client';
import { useSelector, useDispatch } from 'react-redux';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import type { RootState, AppDispatch } from '@/app/store/store';

export default function ModalRoot() {
  const { isOpen, component: Component, props } = useSelector(
    (state: RootState) => state.modal,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !isOpen || !Component) return null;

  return createPortal(
    <>
      <Component {...props} />
    </>,
    document.body,
  );
}