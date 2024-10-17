import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { makeCallTx } from "./linkingSlice";
import { Post } from "@gno/types";
import * as Linking from 'expo-linking';
import { MakeTxResponse } from "@gnolang/gnonative";
import { ThunkExtra } from "redux/redux-provider";

export interface State {
  postToReply: Post | undefined;
}

const initialState: State = {
  postToReply: undefined,
};

export const setPostToReply = createAsyncThunk("post/reply", async ({ post }: { post: Post }) => {
  return { post };
});

interface RepostTxAndRedirectParams {
  post: Post;
  replyContent: string;
  callerAddressBech32: string;
}

export const repostTxAndRedirectToSign = createAsyncThunk<MakeTxResponse, RepostTxAndRedirectParams, ThunkExtra>("tx/repostTxAndRedirectToSign", async (props, thunkAPI) => {
  const { post, replyContent, callerAddressBech32 } = props;

  const packagePath = "gno.land/r/berty/social";
  const fnc = "RepostThread";
  // post.user.address is in fact a bech32 address
  const args: Array<string> = [String(post.user.address), String(post.id), replyContent];
  const gasFee = "1000000ugnot";
  const gasWanted = BigInt(10000000);

  const res = await makeCallTx({ packagePath, fnc, args, gasFee, gasWanted, callerAddressBech32 }, thunkAPI.extra.gnonative);

  setTimeout(() => {
      const params = [`tx=${encodeURIComponent(res.txJson)}`, `address=${callerAddressBech32}`, `client_name=dSocial`, `reason=Repost a message`, `callback=${encodeURIComponent('tech.berty.dsocial://repost')}`];
      Linking.openURL('land.gno.gnokey://tosign?' + params.join('&'))
  }, 500)

  return res;
})

export const replySlice = createSlice({
  name: "reply",
  initialState,
  reducers: {},
  selectors: {
    selectPostToReply: (state) => state.postToReply,
  },
  extraReducers(builder) {
    builder.addCase(setPostToReply.fulfilled, (state, action) => {
      state.postToReply = action.payload.post;
    });
    builder.addCase(setPostToReply.rejected, (state, action) => {
      console.log("Error while replying a post, please, check the logs. %s", action.error.message);
    });
  },
});

export const { selectPostToReply } = replySlice.selectors;
