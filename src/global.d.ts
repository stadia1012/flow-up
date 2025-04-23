declare global {
  interface List {
    type: "project" | "folder" | "item";
    id: number;
    parentId?: number;
    name: string;
    iconColor: string;
    order: number;
    isFolded?: boolean;
    lists?: List[];
  }

  type ListType = "project" | "folder" | "item";

  interface Modal {
    type: "confirm" | "delete" | "alert";
    title?: ReactNode; 
    description?: ReactNode;
    buttonText?: { 
      apply?: string;
      close?: string;
    };
    isOpen: boolean;
    onSuccess?: () => void; // 확인/삭제 등을 눌렀을 때 동작할 함수
    onClose?: () => void;  // 닫기를 눌렀을 때 동작할 함수
  }
}

export const ReactNativeWebView = window.ReactNativeWebView;