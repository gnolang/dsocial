import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { makeCallTx } from "./linkingSlice";
import { Following } from "@gno/types";
import { ThunkExtra } from "redux/redux-provider";
import * as Linking from 'expo-linking';

export interface ProfileState {
  following: Following[];
  followers: Following[];
  accountName: string;
}

const initialState: ProfileState = {
  following: [],
  followers: [],
  accountName: "",
};

interface FollowsProps {
  following: Following[];
  followers: Following[];
}

export const followAndRedirectToSign = createAsyncThunk<void, { address: string, callerAddress: Uint8Array }, ThunkExtra>("profile/follow", async ({ address, callerAddress }, thunkAPI) => {
  console.log("Follow user: %s", address);
  const gnonative = thunkAPI.extra.gnonative;

  const packagePath = "gno.land/r/berty/social";
  const fnc = "Follow";
  const args: Array<string> = [address];
  const gasFee = "1000000ugnot";
  const gasWanted = BigInt(10000000);
  const callerAddressBech32 = await gnonative.addressToBech32(callerAddress);

  const res = await thunkAPI.dispatch(makeCallTx({ packagePath, fnc, args, gasFee, gasWanted, callerAddressBech32 })).unwrap();

  setTimeout(() => {
    const params = [`tx=${encodeURIComponent(res.txJson)}`, `address=${callerAddressBech32}`, 'client_name=dSocial', 'reason=Folow a user', `callback=${encodeURIComponent('tech.berty.dsocial://account')}`];
    Linking.openURL('land.gno.gnokey://tosign?' + params.join('&'))
  }, 500)
});

export const setFollows = createAsyncThunk("profile/setFollows", async ({ following, followers }: FollowsProps, _) => {
  return { following, followers };
});

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  selectors: {
    selectAccountName: (state) => state.accountName,
    selectFollowers: (state) => state.followers,
    selectFollowing: (state) => state.following,
  },
  extraReducers(builder) {
    builder.addCase(setFollows.fulfilled, (state, action) => {
      state.following = action.payload.following;
      state.followers = action.payload.followers;
    });
    builder.addCase(setFollows.rejected, (state, action) => {
      console.log("Error while fetching follows, please, check the logs. %s", action.error.message);
    });
  },
});

export const { selectAccountName, selectFollowers, selectFollowing } = profileSlice.selectors;
