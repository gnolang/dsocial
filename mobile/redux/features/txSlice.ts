import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Post } from "@gno/types";
import * as Linking from 'expo-linking';
interface State {
    postToReply: Post | undefined;
}

const initialState: State = {
    postToReply: undefined,
};

export const requestAddressForGnokeyMobile = createAsyncThunk<Promise<boolean>>("tx/requestAddressForGnokeyMobile", () => {
    const callback = encodeURIComponent('tech.berty.dsocial://post');
    return Linking.openURL(`land.gno.gnokey://toselect?callback=${callback}`);
});

export const txSlice = createSlice({
    name: "tx",
    initialState,
    reducers: {},
    selectors: {
        selectPostToReply: (state) => state.postToReply,
    },
    extraReducers(builder) {
        // builder.addCase(setPostToReply.fulfilled, (state, action) => {
        //   state.postToReply = action.payload.post;
        // });
        // builder.addCase(setPostToReply.rejected, (state, action) => {
        //   console.log("Error while replying a post, please, check the logs. %s", action.error.message);
        // });
    },
});

// export const { selectPostToReply } = txSlice.selectors;
