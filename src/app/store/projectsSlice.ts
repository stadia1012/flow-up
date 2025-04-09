import { createSlice, PayloadAction, createAsyncThunk  } from '@reduxjs/toolkit';
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
    // 프로젝트 간 폴더 이동 액션 (하나의 액션에서 두 작업을 수행)
    moveFolder: (
      state,
      action: PayloadAction<{
        sourceProjectId: number;
        targetProjectId: number;
        folderId: number;
        targetIndex: number;
      }>
    ) => {
      const { sourceProjectId, targetProjectId, folderId, targetIndex } =
        action.payload;
      const sourceProject : List = state.projects.find((p) => p.id === sourceProjectId) as List;
      const targetProject : List  = state.projects.find((p) => p.id === targetProjectId) as List;
      if (sourceProject && targetProject) {
        // source 프로젝트에서 폴더 찾기
        const folder = sourceProject.lists?.find((f) => f.id === folderId);
        if (folder) {
          // source 프로젝트에서 제거
          sourceProject.lists = sourceProject.lists?.filter((f) => f.id !== folderId);
          // 필요하다면 parentId 업데이트
          folder.parentId = targetProjectId;
          // target 프로젝트에 추가 (targetIndex가 지정되면 해당 위치에, 없으면 마지막에)
          if (typeof targetIndex === 'number') {
            targetProject.lists?.splice(targetIndex, 0, folder);
          }
        }
      }
    },
    // 같은 프로젝트 내 폴더 재정렬 (예: 동일 프로젝트 내 이동)
    // reorderFolderWithinProject: (
    //   state,
    //   action: PayloadAction<{ projectId: number; folderId: string; targetIndex: number }>
    // ) => {
    //   const { projectId, folderId, targetIndex } = action.payload;
    //   const project = state.projects.find((p) => p.id === projectId);
    //   if (project) {
    //     const folderIndex = project.lists.findIndex((f) => f.id === folderId);
    //     if (folderIndex >= 0) {
    //       const [folder] = project.lists.splice(folderIndex, 1);
    //       project.lists.splice(targetIndex, 0, folder);
    //     }
    //   }
    // },
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
  moveFolder,
  // reorderFolderWithinProject,
} = projectsSlice.actions;

export default projectsSlice.reducer;