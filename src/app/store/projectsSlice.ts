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
    // List 이름 업데이트
    setNameState: (
      state,
      action: PayloadAction<{ type: string, id: number, newName : string }>
    ) => {
      const { type, id, newName } = action.payload;

      const list : List =  state.projects
        .flatMap((p) => p.lists || [])
        .find((f) => f.type == type && f.id === id) as List;

      list.name = newName;
    },
    // 프로젝트 간 폴더 이동
    moveFolder: (
      state,
      action: PayloadAction<{
        sourceParentId: number;
        targetParentId: number;
        sourceId: number;
        targetIndex: number;
      }>
    ) => {
      const { sourceParentId, targetParentId, sourceId, targetIndex } =
        action.payload;
      const sourceProject : List = state.projects.find((p) => p.id === sourceParentId) as List;
      const targetProject : List = state.projects.find((p) => p.id === targetParentId) as List;
      if (sourceProject && targetProject) {
        // source 프로젝트에서 폴더 찾기
        const folder = sourceProject.lists?.find((f) => f.id === sourceId);
        if (folder) {
          // source 프로젝트에서 제거
          sourceProject.lists = sourceProject.lists?.filter((f) => f.id !== sourceId);
          // parentId 업데이트
          folder.parentId = targetParentId;
          // target 프로젝트에 추가
          if (typeof targetIndex === 'number') {
            targetProject.lists?.splice(targetIndex, 0, folder);
          }
        }
      }
    },
    // 폴더 간 아이템 이동
    moveItem: (
      state,
      action: PayloadAction<{
        sourceParentId: number;
        targetParentId: number;
        sourceId: number;
        targetIndex: number;
      }>
    ) => {
      const { sourceParentId, targetParentId, sourceId, targetIndex } =
        action.payload;
      const sourceFolder : List = state.projects
        .flatMap((p) => p.lists || []) // 모든 lists를 하나의 배열로 평탄화
        .find((f) => f.id === sourceParentId) as List;
      
      const targetFolder : List = state.projects
        .flatMap((p) => p.lists || [])
        .find((f) => f.id === targetParentId) as List;
      if (sourceFolder && targetFolder) {
        // source 폴더에서 아이템 찾기
        const item = sourceFolder.lists?.find((f) => f.id === sourceId);
        if (item) {
          // source 폴더에서 제거
          sourceFolder.lists = sourceFolder.lists?.filter((f) => f.id !== sourceId);
          // parentId 업데이트
          item.parentId = targetParentId;
          // target 폴더에서 추가
          if (typeof targetIndex === 'number') {
            targetFolder.lists?.splice(targetIndex, 0, item);
          }
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
  addFolder,
  removeFolder,
  setNameState,
  setIsFoldedState,
  moveFolder,
  moveItem,
  // reorderFolderWithinProject,
} = projectsSlice.actions;

export default projectsSlice.reducer;