import { configureStore } from "@reduxjs/toolkit";
import { accountSlice, profileSlice, replySlice } from "./features";
import type { TypedUseSelectorHook } from "react-redux";
import { useSelector, useDispatch } from "react-redux";

export const store = configureStore({
  reducer: {
    [accountSlice.reducerPath]: accountSlice.reducer,
    [profileSlice.reducerPath]: profileSlice.reducer,
    [replySlice.reducerPath]: replySlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAppDispatch: () => AppDispatch = useDispatch;

export type AppDispatch = typeof store.dispatch;

export * from "./features";
