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

type MakeTxAndRedirectParams = {
    postContent: string,
    callerAddressBech32: string,
};

export const makeCallTxAndRedirectToSign = createAsyncThunk<MakeTxResponse, MakeTxAndRedirectParams, ThunkExtra>("tx/makeCallTxAndRedirectToSign", async (props, thunkAPI) => {
    const { callerAddressBech32, postContent } = props;

    const packagePath = "gno.land/r/berty/social";
    const fnc = "PostMessage";
    const args: Array<string> = [postContent];
    const gasFee = "1000000ugnot";
    const gasWanted = BigInt(10000000);

    const res = await thunkAPI.dispatch(makeCallTx({packagePath, fnc, args, gasFee, gasWanted, callerAddressBech32 })).unwrap();

    setTimeout(() => {
        const params = [`tx=${encodeURIComponent(res.txJson)}`, `address=${callerAddressBech32}`, `client_name=dSocial`, `reason=Post a message`];
        Linking.openURL('land.gno.gnokey://tosign?' + params.join('&'))
    }, 500)

    return res;
})

type MakeTxParams = {
    packagePath: string,
    fnc: string,
    args: string[],
    gasFee: string,
    gasWanted: bigint,
    send?: string,
    memo?: string,
    callerAddressBech32: string,
};

export const makeCallTx = createAsyncThunk<MakeTxResponse, MakeTxParams, ThunkExtra>("tx/makeCallTx", async (props, thunkAPI) => {
    const {packagePath, fnc, callerAddressBech32, gasFee, gasWanted, args } = props;

    console.log("making a tx for: ", callerAddressBech32);

    const gnonative = thunkAPI.extra.gnonative;
    const address = await gnonative.addressFromBech32(callerAddressBech32);

    return await gnonative.makeCallTx(packagePath, fnc, args, gasFee, gasWanted, address)
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
        selectQueryParamsAddress: (state: State) => state.linkingParsedURl?.queryParams?.address as string | undefined,
    },
});

export const { clearLinking } = linkingSlice.actions;

export const { selectLinkingParsedURL, selectQueryParams, selectQueryParamsAddress, selectPath } = linkingSlice.selectors;
