import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { accountSlice, profileSlice, replySlice, linkingSlice } from "./features";
import { GnoNativeApi, useGnoNativeContext } from "@gnolang/gnonative";
import { signUpSlice } from "./features/signupSlice";
import { useSearch, UseSearchReturnType } from "@gno/hooks/use-search";
import { useNotificationContext, UseNotificationReturnType } from "@gno/provider/notification-provider";
import { useUserCache } from "@gno/hooks/use-user-cache";

interface Props {
  children: React.ReactNode;
}


export interface ThunkExtra {
  extra: { gnonative: GnoNativeApi; search: UseSearchReturnType; push: UseNotificationReturnType, userCache: ReturnType<typeof useUserCache> };
}

const reducer = {
    [accountSlice.reducerPath]: accountSlice.reducer,
    [profileSlice.reducerPath]: profileSlice.reducer,
    [replySlice.reducerPath]: replySlice.reducer,
    [signUpSlice.reducerPath]: signUpSlice.reducer,
    [linkingSlice.reducerPath]: linkingSlice.reducer,
}

export type RootState = typeof reducer

const ReduxProvider: React.FC<Props> = ({ children }) => {
  // Exposing GnoNative API to reduxjs/toolkit
  const { gnonative } = useGnoNativeContext();
  const search = useSearch();
  const push = useNotificationContext();
  const userCache= useUserCache();

  const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,

        thunk: {
          // To make Thunk inject gnonative in all Thunk objects.
          // https://redux.js.org/tutorials/essentials/part-6-performance-normalization#thunk-arguments
          extraArgument: {
            gnonative,
            search,
            push,
            userCache,
          },
        },
      }),
  });

  return <Provider store={store}>{children}</Provider>;
};

export { ReduxProvider };
