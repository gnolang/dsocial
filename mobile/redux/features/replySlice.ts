import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Post } from "@gno/types";

export interface State {
  postToReply: Post | undefined;
}

const initialState: State = {
  postToReply: undefined,
};

export const setPostToReply = createAsyncThunk("post/reply", async ({ post }: { post: Post }) => {
  return { post };
});

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
