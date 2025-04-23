import { configureStore } from '@reduxjs/toolkit'
import projectsReducer from './projectsSlice';
import modalSliceReducer from './modalSlice';

const store = configureStore({
  reducer: {
    projects: projectsReducer,
    modal: modalSliceReducer,
  },
});

// 타입 정의
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
