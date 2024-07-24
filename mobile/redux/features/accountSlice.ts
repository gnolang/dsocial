import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { User } from "@gno/types";
import { KeyInfo } from "@buf/gnolang_gnonative.bufbuild_es/gnonativetypes_pb";
import { GnoNativeApi } from "@gnolang/gnonative";
import { ThunkExtra } from "redux/redux-provider";

export interface CounterState {
  account?: User;
}

const initialState: CounterState = {
  account: undefined,
};

interface LoginParam {
  keyInfo: KeyInfo;
}

export const loggedIn = createAsyncThunk<User, LoginParam, ThunkExtra>("user/loggedIn", async (param, config) => {
  const { keyInfo } = param;

  const gnonative = config.extra.gnonative as GnoNativeApi;

  const bech32 = await gnonative.addressToBech32(keyInfo.address);
  const user: User = { address: bech32, name: keyInfo.name };

  return user;
});

export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    logedOut: (state) => {
      state.account = undefined;
    },
  },

  extraReducers(builder) {
    builder.addCase(loggedIn.fulfilled, (state, action) => {
      state.account = action.payload;
    });
    builder.addCase(loggedIn.rejected, (_, action) => {
      console.error("loggedIn.rejected", action);
    });
  },

  selectors: {
    selectAccount: (state) => state.account,
  },
});

export const { logedOut } = accountSlice.actions;

export const { selectAccount } = accountSlice.selectors;
