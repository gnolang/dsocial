import { MakeTxResponse } from "@gnolang/gnonative";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as Linking from 'expo-linking';
import { ThunkExtra } from "redux/redux-provider";

interface State {
    linkingParsedURl: Linking.ParsedURL | undefined;
    queryParams: Linking.QueryParams | undefined;
    path: string | undefined;
    hostname: string | undefined;
}

const initialState: State = {
    linkingParsedURl: undefined,
    queryParams: undefined,
    path: undefined,
    hostname: undefined,
};

export const hasParam = (param: string, queryParams: Linking.QueryParams | undefined): boolean => {
    return Boolean(queryParams && queryParams[param] !== undefined);
}

export const requestLoginForGnokeyMobile = createAsyncThunk<boolean>("tx/requestLoginForGnokeyMobile", async () => {
    console.log("requesting login for GnokeyMobile");
    const callback = encodeURIComponent('tech.berty.dsocial:///login-callback');
    return await Linking.openURL(`land.gno.gnokey://tologin?callback=${callback}`);
})

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

type SetLinkingResponse = Partial<State>;

export const setLinkingParsedURL = createAsyncThunk<SetLinkingResponse, Linking.ParsedURL, ThunkExtra>("tx/setLinkingParsedURL", async (linkingParsedURl, thunkAPI) => {
    const { hostname, path, queryParams } = linkingParsedURl;

    return {
        linkingParsedURl,
        queryParams: queryParams || undefined,
        path: path || undefined,
        hostname: hostname || undefined,
    }
})

/**
 * Slice to handle linking between the app and the GnokeyMobile app
 */
export const linkingSlice = createSlice({
    name: "linking",
    initialState,
    extraReducers: (builder) => {
        builder.addCase(setLinkingParsedURL.fulfilled, (state, action) => {
            state.linkingParsedURl = action.payload.linkingParsedURl;
            state.queryParams = action.payload.queryParams;
            state.path = action.payload.path;
            state.hostname = action.payload.hostname;
        })
    },
    reducers: {
        clearLinking: (state) => {
            state.linkingParsedURl = undefined;
            state.queryParams = undefined;
            state.path = undefined;
            state.hostname = undefined;
        }
    },
    selectors: {
        selectPath: (state: State) => state.path,
        selectQueryParams: (state: State) => state.queryParams,
        selectLinkingParsedURL: (state: State) => state.linkingParsedURl,
        selectQueryParamsAddress: (state: State) => state.linkingParsedURl?.queryParams?.address,
    },
});

export const { clearLinking } = linkingSlice.actions;

export const { selectLinkingParsedURL, selectQueryParams, selectQueryParamsAddress, selectPath } = linkingSlice.selectors;
