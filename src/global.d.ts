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
    dropdownOptions?: DropdownOption[];
    canEdit?: boolean; // 현재 사용자의 수정가능 여부
  };

  type TaskRow = {
    values: { [key: number]: string } // number 키와 string 값
    rowId: number;
    parentId: number | null;
    level: number;
    order: number;
    subRows?: TaskRow[];
    tagIds: number[];
  };

  type DropdownOption = {
    id: string;  // tempId를 uuid로 사용하기 때문에 string으로 정의
    order: number;
    color: string;
    name: string;
  }

  type RowTag = {
    id: number;
    name: string;
    color: string;
  }
}
 // fieldSidebar types
type FieldSidebarType = "default" | "dropdown" | "existing";

// fieldType
type TaskFieldType = {
  fieldTypeId: number,
  name: string,
  type: FieldDataType,
  dropdownOptions: DropdownOption[],
}

type FieldDataType = 'text' | 'number' | 'dropdown';

type ToastType = 'success' | 'error' | 'info';

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // 기본 유지 시간(ms)
}

type OrgTreeNode = {
  type: 'user' | 'department',
  id: string,
  title: string
}

export const ReactNativeWebView = window.ReactNativeWebView;