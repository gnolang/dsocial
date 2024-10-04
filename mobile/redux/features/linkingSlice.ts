import { MakeTxResponse } from "@gnolang/gnonative";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { set } from "date-fns";
import * as Linking from 'expo-linking';
import { RootState, ThunkExtra } from "redux/redux-provider";

interface State {
    linkingParsedURl: Linking.ParsedURL | undefined;
    queryParams: Linking.QueryParams | undefined;
}

const initialState: State = {
    linkingParsedURl: undefined,
    queryParams: undefined,
};

export const hasParam = (param: string, queryParams: Linking.QueryParams | undefined): boolean => {
    return Boolean(queryParams && queryParams[param] !== undefined);
}

export const requestAddressForGnokeyMobile = createAsyncThunk<boolean>("tx/requestAddressForGnokeyMobile", async () => {
    console.log("requesting address for GnokeyMobile");
    const callback = encodeURIComponent('tech.berty.dsocial://post');
    return await Linking.openURL(`land.gno.gnokey://toselect?callback=${callback}`);
});

export const makeCallTxAndRedirect = createAsyncThunk<MakeTxResponse, { bech32: string, postContent: string }, ThunkExtra>("tx/makeCallTx", async ({ bech32, postContent }, thunkAPI) => {
    console.log("making a tx to: ", bech32);

    const gnonative = thunkAPI.extra.gnonative;
    const address = await gnonative.addressFromBech32(bech32);
    const gasFee = "1000000ugnot";
    const gasWanted = BigInt(10000000);
    const args: Array<string> = [postContent];

    const res = await gnonative.makeCallTx("gno.land/r/berty/social", "PostMessage", args, gasFee, gasWanted, address)

    setTimeout(() =>
        Linking.openURL('land.gno.gnokey://tosign?tx=' + encodeURIComponent(res.txJson)), 500)

    return res
})

export const broadcastTxCommit = createAsyncThunk<void, string, ThunkExtra>("tx/broadcastTxCommit", async (signedTx, thunkAPI) => {
    console.log("broadcasting tx: ", signedTx);

    const gnonative = thunkAPI.extra.gnonative;
    await gnonative.broadcastTxCommit(signedTx);
});

/**
 * Slice to handle linking between the app and the GnokeyMobile app
 */
export const linkingSlice = createSlice({
    name: "linking",
    initialState,
    reducers: {
        setLinkingParsedURL: (state, action) => {
            state.linkingParsedURl = action.payload;
            state.queryParams = action.payload?.queryParams;
        }
    },
    selectors: {
        selectQueryParams: (state: State) => state.queryParams,
        selectLinkingParsedURL: (state: State) => state.linkingParsedURl,
        selectQueryParamsAddress: (state: State) => state.linkingParsedURl?.queryParams?.address,
    },
});

export const { setLinkingParsedURL } = linkingSlice.actions;

export const { selectLinkingParsedURL, selectQueryParams, selectQueryParamsAddress } = linkingSlice.selectors;
