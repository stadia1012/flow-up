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

  type Field = {
    id: number;
    name: string;
    type: string;
    order: number;
  };
}

export const ReactNativeWebView = window.ReactNativeWebView;