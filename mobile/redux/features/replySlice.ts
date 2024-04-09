import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Post } from "@gno/types";
import { useFeed } from "@gno/hooks/use-feed";

export interface State {
  postToReply: Post | undefined;
	/** This thread belongs to the postToReply */
	thread: Post[] | undefined;
}

const initialState: State = {
  postToReply: undefined,
	thread: undefined,
};

export const setPostToReply = createAsyncThunk("post/reply", async (post: Post, _) => {
  const { fetchThread } = useFeed();

	const result = await fetchThread(post.user.address, Number(post.id));

  return {post, thread: result.data};
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
  },
});

export const { selectPostToReply, selectReplyThread } = replySlice.selectors;
