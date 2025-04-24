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

  interface ModalProps {
    type: "confirm" | "delete" | "alert";
    title?: ReactNode; 
    description?: ReactNode;
    buttonText?: { 
      confirm?: string;
      cancel?: string;
    };
    onConfirm?: () => void;
    onCancel?: () => void;
  }
}

export const ReactNativeWebView = window.ReactNativeWebView;