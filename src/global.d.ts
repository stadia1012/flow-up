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
  };

  type TaskRow = {
    values: { [key: number]: string } // number 키와 string 값 }
    rowId: number;
    order: number;
  };

  type DropdownOption = {
    id: string;  // tempId를 uuid로 사용하기 때문에 string으로 정의
    order: number;
    color: string;
    name: string;
  }
}
 // fieldSidebar types
type FieldSidebarType = "default" | "dropdown" | "existing";

// fieldType
type TaskFieldType = {
  fieldTypeId: number,
  name: string,
  type: FieldDataType,
  dropdownOptions: DropdownOption[]
}

type FieldDataType = 'text' | 'number' | 'dropdown';

export const ReactNativeWebView = window.ReactNativeWebView;