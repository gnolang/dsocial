import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Post } from "@gno/types";

export interface State {
  postToReply: Post | undefined;
  /** This thread belongs to the postToReply */
  thread: Post[] | undefined;
}

const initialState: State = {
  postToReply: undefined,
  thread: undefined,
};

export const setPostToReply = createAsyncThunk("post/reply", async ({ post, thread }: { post: Post; thread: Post[] }) => {
  return { post, thread };
});

export const replySlice = createSlice({
  name: "reply",
  initialState,
  reducers: {},
  selectors: {
    selectPostToReply: (state) => state.postToReply,
    selectReplyThread: (state) => state.thread,
  },
  extraReducers(builder) {
    builder.addCase(setPostToReply.fulfilled, (state, action) => {
      state.postToReply = action.payload.post;
      state.thread = action.payload.thread;
    });
    builder.addCase(setPostToReply.rejected, (state, action) => {
      state.postToReply = undefined;
      state.thread = undefined;
      console.log("Error while replying a post, please, check the logs.", action.error.message);
    });
  },
});

export const { selectPostToReply, selectReplyThread } = replySlice.selectors;
