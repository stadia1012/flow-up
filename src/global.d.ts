declare global {
  interface List {
    type: ListType;
    id: number;
    parentId?: number;
    name: string;
    iconColor: string;
    order: number;
    isFolded?: boolean;
    lists?: List[];
  }

  type ListType = "project" | "folder" | "item";

  type TaskField = {
    fieldId: number;
    name: string;
    type: string;
    order: number;
    width: number;
  };

  type TaskRow = {
    [key: number]: string; // number 키와 string 값
    rowId: number;
    order: number;
  };
}

export const ReactNativeWebView = window.ReactNativeWebView;