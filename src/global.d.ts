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
    typeId: number;
    type: string;
    order: number;
    width: number;
  };

  type TaskRow = {
    values: { [key: number]: string } // number 키와 string 값 }
    rowId: number;
    order: number;
  };

  type DropdownOption = {
    id: string;
    order: number;
    color: string;
    name: string;
  }
}

export const ReactNativeWebView = window.ReactNativeWebView;