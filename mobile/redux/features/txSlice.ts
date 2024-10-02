import { createAsyncThunk, createSlice, RootState } from "@reduxjs/toolkit";
import { Post } from "@gno/types";
import * as Linking from 'expo-linking';
import { ThunkExtra } from "redux/redux-provider";
interface State {
}

const initialState: State = {
};

export const requestAddressForGnokeyMobile = createAsyncThunk<boolean>("tx/requestAddressForGnokeyMobile", async () => {
    console.log("requesting address for GnokeyMobile");
    const callback = encodeURIComponent('tech.berty.dsocial://post');
    return await Linking.openURL(`land.gno.gnokey://toselect?callback=${callback}`);
});

export const broadcastTxCommit = createAsyncThunk<void, string, ThunkExtra>("tx/broadcastTxCommit", async (signedTx, thunkAPI) => {
    console.log("broadcasting tx: ", signedTx);
    
    const gnonative = thunkAPI.extra.gnonative;

    await gnonative.broadcastTxCommit(signedTx);
});

export const txSlice = createSlice({
    name: "tx",
    initialState,
    reducers: {},
    selectors: {}
});
