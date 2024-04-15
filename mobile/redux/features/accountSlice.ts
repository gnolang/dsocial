import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { User } from "@gno/types";
import { KeyInfo } from "@gno/api/gnonativetypes_pb";
import { useGno } from "@gno/hooks/use-gno";

export interface CounterState {
  account?: User;
}

const initialState: CounterState = {
  account: undefined,
};

export const loggedIn = createAsyncThunk("user/loggedIn", async (keyInfo: KeyInfo, thunkAPI) => {
  const gno = useGno();

  const bech32 = await gno.addressToBech32(keyInfo.address);

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
  },

  selectors: {
    selectAccount: (state) => state.account,
  },
});

export const { logedOut } = accountSlice.actions;

export const { selectAccount } = accountSlice.selectors;
