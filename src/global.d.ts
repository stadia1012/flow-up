declare global {
  interface List {
    name: string;
    isFolded?: boolean;
    lists?: List[];
  }
}

export const ReactNativeWebView = window.ReactNativeWebView;