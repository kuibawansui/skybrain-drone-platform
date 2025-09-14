import { configureStore } from '@reduxjs/toolkit';
import systemSlice from './slices/systemSlice';
import dronesSlice from './slices/dronesSlice';
import riskSlice from './slices/riskSlice';

export const store = configureStore({
  reducer: {
    system: systemSlice,
    drones: dronesSlice,
    risk: riskSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;