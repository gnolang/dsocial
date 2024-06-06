import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Following } from "@gno/types";

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
