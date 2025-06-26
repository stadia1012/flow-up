// components/toast.tsx
'use client';

import React from 'react';
import { Toast as ToastType } from '@/global';

interface Props extends ToastType {
  onClose: (id: string) => void;
}

export default function Toast({ id, message, type, onClose }: Props) {
  const baseStyle = 'flex items-center justify-between px-4 py-2 mb-2 rounded-lg shadow-lg';
  const typeStyles = {
    success: 'bg-green-500/85 text-white',
    error: 'bg-red-500/80 text-white',
    info: 'bg-blue-500/85 text-white',
  };

  return (
    <div className={`${baseStyle} ${typeStyles[type]}`} onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
      
    }}>
      <span>{message}</span>
      <button
        className='p-[3px] hover:bg-gray-200 rounded-[4px] transition mix-blend-multiply'
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClose(id);
        }}>
        <svg className='h-[14px] w-[14px]'
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#555" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" strokeWidth="2">
          <path d="M18 6l-12 12"></path>
          <path d="M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
}