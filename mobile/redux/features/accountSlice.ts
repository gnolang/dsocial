import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { User } from "@gno/types";
import { KeyInfo } from "@buf/gnolang_gnonative.bufbuild_es/gnonativetypes_pb";
import { useGnoNativeContext } from "@gnolang/gnonative";

export interface CounterState {
  account?: User;
}

const initialState: CounterState = {
  account: undefined,
};

export const loggedIn = createAsyncThunk("user/loggedIn", async (param: { keyInfo: KeyInfo; bech32: string }, _) => {
  const { keyInfo, bech32 } = param;

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
