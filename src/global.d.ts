declare global {
  interface List {
    type: "project" | "folder" | "item";
    id: number;
    parentId?: number;
    name: string;
    isFolded?: boolean;
    lists?: List[];
  }
}

export const ReactNativeWebView = window.ReactNativeWebView;