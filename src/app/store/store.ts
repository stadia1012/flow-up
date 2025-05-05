import { configureStore } from '@reduxjs/toolkit'
import projectsReducer from './projectsSlice';

const store = configureStore({
  reducer: {
    projects: projectsReducer,
  },
});

// 타입 정의
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;