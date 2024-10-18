import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { makeCallTx } from "./linkingSlice";
import { User } from "@gno/types";
import { GnoNativeApi } from "@gnolang/gnonative";
import { ThunkExtra } from "redux/redux-provider";
import * as Linking from 'expo-linking';

export interface CounterState {
  account?: User;
}

const initialState: CounterState = {
  account: undefined,
};

interface LoginParam {
  bech32: string;
}

export const loggedIn = createAsyncThunk<User, LoginParam, ThunkExtra>("account/loggedIn", async (param, thunkAPI) => {
  console.log("Logging in", param);
  const { bech32 } = param;

  const gnonative = thunkAPI.extra.gnonative as GnoNativeApi;

  const user: User = {
    name: await getAccountName(bech32, gnonative) || 'Unknown',
    address: await gnonative.addressFromBech32(bech32),
    bech32,
    avatar: await loadBech32AvatarFromChain(bech32, thunkAPI)
  };

  return user;
});

async function getAccountName(bech32: string, gnonative: GnoNativeApi) {
  const accountNameStr = await gnonative.qEval("gno.land/r/demo/users", `GetUserByAddress("${bech32}").Name`);
  console.log("GetUserByAddress result:", accountNameStr);
  const accountName = accountNameStr.match(/\("(\w+)"/)?.[1];
  console.log("GetUserByAddress after regex", accountName);
  return accountName
}

interface AvatarCallTxParams {
  mimeType: string;
  base64: string;
  callerAddressBech32: string;
  pathName: string;
}

export const avatarTxAndRedirectToSign = createAsyncThunk<void, AvatarCallTxParams, ThunkExtra>("account/avatarTxAndRedirectToSign", async (props, thunkAPI) => {
  const { mimeType, base64, callerAddressBech32, pathName } = props;

  const gnonative = thunkAPI.extra.gnonative;

  const gasFee = "1000000ugnot";
  const gasWanted = BigInt(10000000);
  const args: Array<string> = ["Avatar", String(`data:${mimeType};base64,` + base64)];
  const res = await makeCallTx({ packagePath: "gno.land/r/demo/profile", fnc: "SetStringField", args, gasFee, gasWanted, callerAddressBech32 }, gnonative);

  const params = [`tx=${encodeURIComponent(res.txJson)}`, `address=${callerAddressBech32}`, `client_name=dSocial`, `reason=Upload a new avatar`, `callback=${encodeURIComponent('tech.berty.dsocial://' + pathName)}`];
  Linking.openURL('land.gno.gnokey://tosign?' + params.join('&'))

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
      console.log("Logged in", action.payload);
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
