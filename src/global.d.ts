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
}

export const ReactNativeWebView = window.ReactNativeWebView;