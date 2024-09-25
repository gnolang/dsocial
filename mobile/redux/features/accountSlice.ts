import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { User } from "@gno/types";
import { GnoNativeApi, KeyInfo } from "@gnolang/gnonative";
import { ThunkExtra } from "redux/redux-provider";
import { useUserCache } from "@gno/hooks/use-user-cache";

export interface CounterState {
  account?: User;
}

const initialState: CounterState = {
  account: undefined,
};

interface LoginParam {
  keyInfo: KeyInfo;
}

export const loggedIn = createAsyncThunk<User, LoginParam, ThunkExtra>("account/loggedIn", async (param, thunkAPI) => {
  const { keyInfo } = param;

  const gnonative = thunkAPI.extra.gnonative as GnoNativeApi;

  const bech32 = await gnonative.addressToBech32(keyInfo.address);
  const user: User = { bech32, ...keyInfo };

  user.avatar = await loadBech32AvatarFromChain(bech32, thunkAPI);

  return user;
});

export const saveAvatar = createAsyncThunk<void, { mimeType: string, base64: string }, ThunkExtra>("account/saveAvatar", async (param, thunkAPI) => {
  const { mimeType, base64 } = param;

  const gnonative = thunkAPI.extra.gnonative;
  const userCache = thunkAPI.extra.userCache

  const state = await thunkAPI.getState() as CounterState;
  console.log("statexxx", state);
  // @ts-ignore
  const address = state.account?.account?.address;

  try {
    const gasFee = "1000000ugnot";
    const gasWanted = BigInt(10000000);

    const args: Array<string> = ["Avatar", String(`data:${mimeType};base64,` + base64)];
    for await (const response of await gnonative.call("gno.land/r/demo/profile", "SetStringField", args, gasFee, gasWanted, address)) {
      console.log("response on saving avatar: ", response);
    }

    userCache.invalidateCache();
  } catch (error) {
    console.error("on saving avatar", error);
  }
});

export const reloadAvatar = createAsyncThunk<string | undefined, void, ThunkExtra>("account/reloadAvatar", async (param, thunkAPI) => {

  const state = await thunkAPI.getState() as CounterState;
  // @ts-ignore
  const bech32 = state.account?.account?.bech32;
  if (bech32) {
    return await loadBech32AvatarFromChain(bech32, thunkAPI);
  }
  return undefined;
});

const loadBech32AvatarFromChain = async (bech32: string, thunkAPI: ThunkExtra) => {
  const gnonative = thunkAPI.extra.gnonative as GnoNativeApi;
  const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/tmp"

  try {
    console.log("Loading avatar for", bech32);
    const response = await gnonative.qEval("gno.land/r/demo/profile", `GetStringField("${bech32}","Avatar", "${DEFAULT_AVATAR}")`);
    return response.substring(2, response.length - "\" string)".length);
  } catch (error) {
    console.error("Error loading avatar", error);
  }
  return DEFAULT_AVATAR;
}

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
    builder.addCase(reloadAvatar.fulfilled, (state, action) => {
      if (state.account) {
        console.log("Reloading avatar", action.payload);
        state.account.avatar = action.payload;
      } else {
        console.error("No account to set avatar");
      }
    });
  },

  selectors: {
    selectAccount: (state) => state.account,
    selectAvatar: (state) => state.account?.avatar,
  },
});

export const { logedOut } = accountSlice.actions;

export const { selectAccount, selectAvatar } = accountSlice.selectors;
