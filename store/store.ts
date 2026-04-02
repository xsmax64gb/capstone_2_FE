import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from './api/baseApi'
import './services/adminApi'
import './services/authApi'
import './services/exercisesApi'
import './services/learnApi'
import './services/placementApi'
import './services/vocabulariesApi'
import authReducer from './slices/authSlice'
import notificationReducer from './slices/notificationSlice'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
