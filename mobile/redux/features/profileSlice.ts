import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Following } from "@gno/types";
import { useUserCache } from "@gno/hooks/use-user-cache";

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
  const cache = useUserCache();

  const enrichFollows = async (follows: Following[]) => {
    for await (const item of follows) {
      const user = await cache.getUser(item.address);
      item.name = user.name;
    }
  };

  await enrichFollows(following);
  await enrichFollows(followers);

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
  },
});

export const { selectAccountName, selectFollowers, selectFollowing } = profileSlice.selectors;
