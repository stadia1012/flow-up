import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getProjects } from '@/app/controllers/projectController';

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async () => {
    const projects: List[] = await getProjects();
    return projects;
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [] as List[],
    loading: false,
    error: null as string | null,
  },
  reducers: {
    // target project에 폴더 추가
    addFolder: (
      state,
      action: PayloadAction<{ projectId: number; folder: List; index?: number }>
    ) => {
      const { projectId, folder, index }  = action.payload;
      const project: List = state.projects.find((p) => p.id === projectId) as List;
      if (project && index) {
        project.lists?.splice(index, 0, folder);
      }
    },
    // source project에서 폴더 제거
    removeFolder: (
      state,
      action: PayloadAction<{ projectId: number; folderId: number }>
    ) => {
      const { projectId, folderId } = action.payload;
      const project = state.projects.find((p) => p.id === projectId);
      if (project) {
        project.lists = project.lists?.filter((f) => f.id !== folderId);
      }
    },
    // projects 반영
    setProjectsState: (
      state,
      action: PayloadAction<{ initialProjects : List[] }>
    ) => {
      const { initialProjects } = action.payload;
      state.projects = initialProjects;
    },
    // 폴더 isFolded 상태 업데이트
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
    // [List 이름 업데이트]
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
    // [project 이동]
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
    // [folder 이동]
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
    // [item 이동]
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
  },
   extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load projects';
      });
  },
});

export const {
  setProjectsState,
  addFolder,
  removeFolder,
  setNameState,
  setIsFoldedState,
  moveProject,
  moveFolder,
  moveItem,
  // reorderFolderWithinProject,
} = projectsSlice.actions;

export default projectsSlice.reducer;