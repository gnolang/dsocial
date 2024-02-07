import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { User } from "@gno/types";

export interface CounterState {
  account?: User;
}

const initialState: CounterState = {
  account: undefined,
};

export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    loggedIn: (state, action: PayloadAction<User>) => {
      state.account = action.payload;
    },
    logedOut: (state) => {
      state.account = undefined;
    },
  },

  selectors: {
    selectAccount: (state) => state.account,
  },
});

export const { loggedIn, logedOut } = accountSlice.actions;

export const { selectAccount } = accountSlice.selectors;
