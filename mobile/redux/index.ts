import type { TypedUseSelectorHook } from "react-redux";
import { useSelector, useDispatch } from "react-redux";


// TODO: do not use any type
export type RootState = ReturnType<any>;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAppDispatch: () => AppDispatch = useDispatch;

// TODO: do not use any type
export type AppDispatch = any;

export * from "./features";
