// context/toastContext.tsx
'use client';
import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import { Toast } from '@/global';
import ToastContainer from '@/app/component/toastContainer';

interface ToastContextValue {
  toastList: Toast[];
  showToast: (message: string, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toastList, setToastList] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 3000) => {
    const id = crypto.randomUUID();
    setToastList((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => removeToast(id), duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToastList((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toastList, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toastList} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast는 ToastProvider 내부에서 사용해야 합니다.');
  return context;
}