import { GnoNativeApi, MakeTxResponse } from "@gnolang/gnonative";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as Linking from 'expo-linking';
import { ThunkExtra } from "redux/redux-provider";

interface State {
    txJsonSigned: string | undefined;
    bech32AddressSelected: string | undefined;
}

const initialState: State = {
    txJsonSigned: undefined,
    bech32AddressSelected: undefined,
};

export const requestLoginForGnokeyMobile = createAsyncThunk<boolean>("tx/requestLoginForGnokeyMobile", async () => {
    console.log("requesting login for GnokeyMobile");
    const callback = encodeURIComponent('tech.berty.dsocial://login-callback');
    return await Linking.openURL(`land.gno.gnokey://tologin?callback=${callback}`);
})

type MakeTxAndRedirectParams = {
    postContent: string,
    callerAddressBech32: string,
};

export const postTxAndRedirectToSign = createAsyncThunk<MakeTxResponse, MakeTxAndRedirectParams, ThunkExtra>("tx/makeCallTxAndRedirectToSign", async (props, thunkAPI) => {
    const { callerAddressBech32, postContent } = props;

    const packagePath = "gno.land/r/berty/social";
    const fnc = "PostMessage";
    const args: Array<string> = [postContent];
    const gasFee = "1000000ugnot";
    const gasWanted = BigInt(10000000);

    const res = await makeCallTx({ packagePath, fnc, args, gasFee, gasWanted, callerAddressBech32 }, thunkAPI.extra.gnonative);

    setTimeout(() => {
        const params = [`tx=${encodeURIComponent(res.txJson)}`, `address=${callerAddressBech32}`, `client_name=dSocial`, `reason=Post a message`];
        Linking.openURL('land.gno.gnokey://tosign?' + params.join('&'))
    }, 500)

    return res;
})

type MakeCallTxParams = {
    packagePath: string,
    fnc: string,
    args: string[],
    gasFee: string,
    gasWanted: bigint,
    send?: string,
    memo?: string,
    callerAddressBech32: string,
};

export const makeCallTx = async (props : MakeCallTxParams, gnonative: GnoNativeApi) : Promise<MakeTxResponse> => {
    const { packagePath, fnc, callerAddressBech32, gasFee, gasWanted, args } = props;

    console.log("making a tx for: ", callerAddressBech32);
    const address = await gnonative.addressFromBech32(callerAddressBech32);

    return await gnonative.makeCallTx(packagePath, fnc, args, gasFee, gasWanted, address)
}

export const broadcastTxCommit = createAsyncThunk<void, string, ThunkExtra>("tx/broadcastTxCommit", async (signedTx, thunkAPI) => {
    console.log("broadcasting tx: ", signedTx);

    const gnonative = thunkAPI.extra.gnonative;
    const res = await gnonative.broadcastTxCommit(signedTx);
    console.log("broadcasted tx: ", res);
});

/**
 * Slice to handle linking between the app and the GnokeyMobile app
 */
export const linkingSlice = createSlice({
    name: "linking",
    initialState,
    reducers: {
        setLinkingData: (state, action) => {
            const queryParams = action.payload.queryParams

            state.bech32AddressSelected = queryParams?.address ? queryParams.address as string : undefined
            state.txJsonSigned = queryParams?.tx ? queryParams.tx as string : undefined
        },
        clearLinking: (state) => {
            console.log("clearing linking data");
            state = { ...initialState };
        }
    },
    selectors: {
        selectQueryParamsTxJsonSigned: (state: State) => state.txJsonSigned as string | undefined,
        selectBech32AddressSelected: (state: State) => state.bech32AddressSelected as string | undefined,
    },
});

export const { clearLinking, setLinkingData } = linkingSlice.actions;

export const { selectQueryParamsTxJsonSigned, selectBech32AddressSelected } = linkingSlice.selectors;
