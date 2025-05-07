import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [] as List[],
    loading: false,
    error: null as string | null,
  },
  reducers: {
    // projects 반영
    setProjectsState: (
      state,
      action: PayloadAction<{ initialProjects : List[] }>
    ) => {
      const { initialProjects } = action.payload;
      state.projects = initialProjects;
    },
    // folder isFolded 상태 업데이트
    setIsFoldedState: (
      state,
      action: PayloadAction<{ type: string, folderId: number, isFolded : boolean }>
    ) => {
      const { type, folderId, isFolded } = action.payload;

      const list : List =  state.projects
        .flatMap((p) => p.lists || [])
        .find((f) => f.type == type && f.id === folderId) as List;

      list.isFolded = isFolded;
    },
    // [Item 이름 업데이트]
    setNameState: (
      state,
      action: PayloadAction<{ type: string, id: number, newName : string }>
    ) => {
      const { type, id, newName } = action.payload;

      const allList = state.projects.flatMap(project => [
        project, // 프로젝트 추가
        ...(project.lists ?? []).flatMap(folder => [
          folder, // 폴더 추가
          ...(folder.lists ?? []) // 아이템 추가
        ])
      ]);
      const targetItem = allList.find(item => item.type === type && item.id === id);

      if (targetItem) {
        targetItem.name = newName;
      }
    },
    // [Item iconColor 업데이트]
    setIconColorState: (
      state,
      action: PayloadAction<{ type: string, id: number, newHex : string }>
    ) => {
      const { type, id, newHex } = action.payload;
      const allList = state.projects.flatMap(project => [
        project, // 프로젝트 추가
        ...(project.lists ?? []).flatMap(folder => [
          folder, // 폴더 추가
          ...(folder.lists ?? []) // 아이템 추가
        ])
      ]);
      const targetItem = allList.find(item => item.type === type && item.id === id);
      if (targetItem) {
        targetItem.iconColor = newHex;
      }
    },
    // [Item.project 이동]
    moveProject: (
      state,
      action: PayloadAction<{
        sourceId: number;
        updateOrder: number;
      }>
    ) => {
      const { sourceId, updateOrder } = action.payload;
      // source 프로젝트 찾기
      const project = state.projects.find((f) => f.id === sourceId);
      if (project) {
        // 프로젝트 제거
        state.projects = state.projects
          ?.filter((f) => f.id !== sourceId)
          .map((p) => {
            if (p.order > project.order) p.order -= 1
            return p;
        });
        // 프로젝트 추가
        project.order = updateOrder;
        state.projects = [...(state.projects || []), project]
          .map((p) => {
            if (p.order >= updateOrder && p.id != sourceId) p.order += 1
            return p;
        });
      }
    },
    // [Item.folder 이동]
    moveFolder: (
      state,
      action: PayloadAction<{
        sourceParentId: number;
        targetParentId: number;
        sourceId: number;
        updateOrder: number;
      }>
    ) => {
      const { sourceParentId, targetParentId, sourceId, updateOrder } =
        action.payload;
      const sourceProject = state.projects.find((p) => p.id === sourceParentId);
      const targetProject = state.projects.find((p) => p.id === targetParentId);
      if (sourceProject && targetProject) {
        // source 프로젝트에서 폴더 찾기
        const folder = sourceProject.lists?.find((f) => f.id === sourceId);
        if (folder) {
          // source 프로젝트에서 제거
          sourceProject.lists = sourceProject.lists
            ?.filter((f) => f.id !== sourceId)
            .map((p) => {
              if (p.order > folder.order) p.order -= 1
              return p;
          });
          // parentId 업데이트
          folder.parentId = targetParentId;
          // target 프로젝트에 추가
          folder.order = updateOrder;
          targetProject.lists = [...(targetProject.lists || []), folder]
            .map((p) => {
              if (p.order >= updateOrder && p.id != sourceId) p.order += 1
              return p;
          });
        }
      }
    },
    // [Item.item 이동]
    moveItem: (
      state,
      action: PayloadAction<{
        sourceParentId: number;
        targetParentId: number;
        sourceId: number;
        updateOrder: number;
      }>
    ) => {
      const { sourceParentId, targetParentId, sourceId, updateOrder } =
        action.payload;
      const sourceFolder = state.projects
        .flatMap((p) => p.lists || [])
        .find((f) => f.id === sourceParentId && f.type == "folder");
      const targetFolder = state.projects
        .flatMap((p) => p.lists || [])
        .find((f) => f.id === targetParentId && f.type == "folder");
      if (sourceFolder && targetFolder) {
        // source 폴더에서 아이템 찾기
        const item = sourceFolder.lists?.find((f) => f.id === sourceId);
        if (item) {
          // source 프로젝트에서 제거
          sourceFolder.lists = sourceFolder.lists
            ?.filter((f) => f.id !== sourceId)
            .map((p) => {
              if (p.order > item.order) p.order -= 1
              return p;
          });
          // parentId 업데이트
          item.parentId = targetParentId;
          // target 프로젝트에 추가
          item.order = updateOrder;
          targetFolder.lists = [...(targetFolder.lists || []), item]
            .map((p) => {
              if (p.order >= updateOrder && p.id != sourceId) p.order += 1
              return p;
          });
        }
      }
    },
    // [add Item]
    addItemToStore: (
      state,
      action: PayloadAction<{
        id: number;
        addType: ListType;
        parentId?: number;
        name: string;
        order: number;
        iconColor: string;
      }>
    ) => {
      const { id, addType, parentId = 1, name, order, iconColor } = action.payload;

      // project의 경우
      if (addType === "project") {
        state.projects.push({
          id,
          type: "project",
          name,
          iconColor,
          order,
          isFolded: false,
          lists: [],
        });
        return;
      }
     
      // all list
      const allList = state.projects.flatMap(project => [
        project, // 프로젝트
        ...(project.lists ?? []).flatMap(folder => [
          folder, // 폴더
          ...(folder.lists ?? []) // 아이템
        ])
      ]);

      let parentType = "root";
      if (addType === "folder") {
        parentType = "project";
      } else if (addType === "item") {
        parentType = "folder";
      }

      // parent 찾기
      const parentItem = allList.find(item => item.type === parentType && item.id === parentId);
      if (!parentItem) return;

      parentItem.lists?.push({
        id,
        type: addType,
        parentId,
        name,
        iconColor,
        order,
        isFolded: true,
        lists: [],
      })
      return;
    },
    // [Item 삭제]
    deleteItemFromStore: (
      state,
      action: PayloadAction<{
        itemType: ListType;
        itemId: number;
      }>
    ) => {
      const { itemType, itemId } = action.payload;

      // project의 경우
      if (itemType === "project") {
        state.projects = state.projects.filter((f) => f.id !== itemId);
        return;
      }

      const allList = state.projects.flatMap(project => [
        project, // 프로젝트
        ...(project.lists ?? []).flatMap(folder => [
          folder, // 폴더
          ...(folder.lists ?? []) // 아이템
        ])
      ]);

      const item = allList.find(item => item.type === itemType && item.id === itemId);
      if (!item) return;

      let parentType = "root";
      if (itemType === "folder") {
        parentType = "project";
      } else if (itemType === "item") {
        parentType = "folder";
      }
      
      const parentItem = allList.find(f => f.type === parentType && f.id === item.parentId);
      if (!parentItem) return;

      parentItem.lists = parentItem.lists?.filter((i) => i.id !== itemId);
    },
  },
});

export const {
  setProjectsState,
  setNameState,
  setIconColorState,
  setIsFoldedState,
  moveProject,
  moveFolder,
  moveItem,
  addItemToStore,
  deleteItemFromStore,
  // getParents
} = projectsSlice.actions;

export default projectsSlice.reducer;