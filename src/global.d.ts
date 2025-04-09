declare global {
  interface List {
    id: number;
    parentId?: number;
    name: string;
    isFolded?: boolean;
    lists?: List[];
  }
}

export const ReactNativeWebView = window.ReactNativeWebView;