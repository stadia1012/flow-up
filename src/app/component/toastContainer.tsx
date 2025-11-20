// components/ToastContainer.tsx
'use client';
import React from 'react';
import Toast from './toast';
import { Toast as ToastType } from '@/global';

interface Props {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="fixed top-[65px] right-5 min-w-[240px] z-100" data-toast-container>
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={onRemove} />
      ))}
    </div>
  );
}