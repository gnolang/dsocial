import { PayloadAction, createAsyncThunk, createSlice, loggedIn } from "@reduxjs/toolkit";
import { GnoNativeApi } from "@gnolang/gnonative";
import { ThunkExtra } from "redux/redux-provider";
import { Alert } from "react-native";

export enum SignUpState {
  user_exists_on_blockchain_and_local_storage = 'user_exists_on_blockchain_and_local_storage',
  user_exists_under_differente_key = 'user_exists_under_differente_key',
  user_exists_only_on_local_storage = 'user_exists_only_on_local_storage',
  user_already_exists_on_blockchain_under_different_name = 'user_already_exists_on_blockchain_under_different_name',
  user_already_exists_on_blockchain = 'user_already_exists_on_blockchain',
  create_account = 'create_account',
  account_created = 'account_created',
}

export interface CounterState {
  signUpState?: SignUpState
  loading: boolean;
  progress: string[];
}

const initialState: CounterState = {
  signUpState: undefined,
  loading: false,
  progress: [],
};

interface SignUpParam {
  name: string;
  password: string;
  phrase: string;
}

/**
 * This thunk checks if the user is already registered on the blockchain and/or local storage.
 * The output is a state that will be used to decide the next step (signUpState).
 *
 * CASE 1.0: The user is: local storage (yes), blockchain (yes), under same name (yes) and address (yes), it will offer to do normal signin or choose new name.
 * CASE 1.1: The user is: local storage (yes), blockchain (yes), under same name (yes) and address (no),  it will offer to delete the local storage.
 * CASE 1.2: The user is: local storage (yes), blockchain (no),  under same name (---) and address (--),  it will offer to delete the local storage.
 *
 * CASE 2.0: The user is: local storage (no), blockchain (yes), under same name (no) and address (yes)
 * CASE 2.1: The user is: local storage (no), blockchain (yes), under same name (no) and address (no)
 *
 * CASE 3.0: The user is: local storage (no), blockchain (no), under same name (---) and address (--), it will proceed to create the account.
 *
 * ref: https://github.com/gnolang/dsocial/issues/72
 */
export const signUp = createAsyncThunk<void, SignUpParam, ThunkExtra>("user/signUp", async (param, config) => {

  const { name, password, phrase } = param;
  const gnonative = config.extra.gnonative as GnoNativeApi;

  config.dispatch(addProgress(`checking if "${name}" is already registered on the blockchain...`))

  const blockchainResult = await gnonative.qEval("gno.land/r/demo/users", `GetUserByName("${name}")`);
  // The result contains something like ("g1cv7yjukd8d3236fwjndztrfj0kej8323lc8rt9" std.Address)
  const blockchainUsersMatch = blockchainResult.match(/\("(\w+)" std\.Address\)/);
  config.dispatch(addProgress(`response for "${name}": "${blockchainUsersMatch}"`))
  const blockchainUsersAddr = blockchainUsersMatch ? blockchainUsersMatch[1] : null;

  let userOnLocalStorage = null;
  try {
    config.dispatch(addProgress(`checking if "${name}" is already on local storage...`))

    userOnLocalStorage = await gnonative.getKeyInfoByNameOrAddress(name);

    config.dispatch(addProgress(`response for "${name}": ${userOnLocalStorage}`))
  } catch (e) {
    // TODO: Check for error other than ErrCryptoKeyNotFound(#151)
    config.dispatch(addProgress(`response for "${name}": ${e}`))
  }

  if (userOnLocalStorage) {
    if (blockchainUsersAddr) {
      if (blockchainUsersAddr == await gnonative.addressToBech32(userOnLocalStorage.address)) {
        // CASE 1.0: Offer to do normal signin, or choose new name
        config.dispatch(signUpState(SignUpState.user_exists_on_blockchain_and_local_storage))
        return;
      }
      else {
        // CASE 1.1: Bad case. Choose new name. (Delete name in keystore?)
        config.dispatch(signUpState(SignUpState.user_exists_under_differente_key))
        return;
      }
    }
    else {
      // CASE 1.2: Offer to onboard existing account, replace it, or choose new name
      config.dispatch(signUpState(SignUpState.user_exists_only_on_local_storage))
      return;
    }
  } else {
    if (blockchainUsersAddr) {
      try {
        config.dispatch(addProgress(`checking for "${blockchainUsersAddr}" on blochchain...`))
        const keystoreInfoByAddr = await gnonative.getKeyInfoByNameOrAddress(blockchainUsersAddr);
        console.log("This name is already registered on the blockchain. The same key has a different name on this phone: " + keystoreInfoByAddr?.name);

        // CASE 2.0: Offer to rename keystoreInfoByAddr.name to name in keystore (password check), and do signin
        config.dispatch(signUpState(SignUpState.user_already_exists_on_blockchain_under_different_name))
        return;
      } catch (e) {
        config.dispatch(addProgress(`response for "${blockchainUsersAddr}": ${e}`))
        // TODO: Check for error other than ErrCryptoKeyNotFound(#151)
      }

      // CASE 2.1: "This name is already registered on the blockchain. Please choose another name."
      config.dispatch(signUpState(SignUpState.user_already_exists_on_blockchain))
      return;
    }

    // Proceed to create the account.
    // CASE 3.0: Proceed to create the account.
    config.dispatch(signUpState(SignUpState.create_account))

    const newAccount = await gnonative.createAccount(name, phrase, password);
    if (!newAccount) {
      config.dispatch(addProgress(`Failed to create account "${name}"`))
      throw new Error(`Failed to create account "${name}"`);
    }

    console.log("createAccount response: " + JSON.stringify(newAccount));

    await gnonative.selectAccount(name);
    await gnonative.setPassword(password);
    await onboard(gnonative, newAccount.name, newAccount.address);
    await config.dispatch(loggedIn({ keyInfo: newAccount }));

    config.dispatch(signUpState(SignUpState.account_created))
  }
})

const onboard = async (gnonative: GnoNativeApi, name: string, address: Uint8Array) => {
  const address_bech32 = await gnonative.addressToBech32(address);
  console.log("onboarding %s, with address: %s", name, address_bech32);

  try {
    const hasBalance = await hasCoins(gnonative, address);

    if (hasBalance) {
      console.log("user %s already has a balance", name);
      await registerAccount(gnonative, name);
      return;
    }

    const response = await sendCoins(address_bech32);
    console.log("sent coins %s", response);

    await registerAccount(gnonative, name);

    // await push.registerDevice(address_bech32);
  } catch (error) {
    console.error("onboard error", error);
  }
};

const registerAccount = async (gnonative: GnoNativeApi, name: string) => {
  console.log("Registering account %s", name);
  try {
    const gasFee = "10000000ugnot";
    const gasWanted = 20000000;
    const send = "200000000ugnot";
    const args: Array<string> = ["", name, "Profile description"];
    for await (const response of await gnonative.call("gno.land/r/demo/users", "Register", args, gasFee, gasWanted, send)) {
      console.log("response: ", JSON.stringify(response));
    }
  } catch (error) {
    Alert.alert("Error on registering account", "" + error);
    console.error("error registering account", error);
  }
};

const hasCoins = async (gnonative: GnoNativeApi, address: Uint8Array) => {
  try {
    console.log("checking if user has balance");
    const balance = await gnonative.queryAccount(address);
    console.log("account balance: %s", balance.accountInfo?.coins);

    if (!balance.accountInfo) return false;

    const hasCoins = balance.accountInfo.coins.length > 0;
    const hasBalance = hasCoins && balance.accountInfo.coins[0].amount > 0;

    return hasBalance;
  } catch (error: any) {
    console.error("error on hasBalance", error["rawMessage"]);
    if (error["rawMessage"] === "invoke bridge method error: unknown: ErrUnknownAddress(#206)") return false;
    return false;
  }
};

const sendCoins = async (address: string) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    To: address,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    reactNative: { textStreaming: true },
  };

  const faucetRemote = process.env.EXPO_PUBLIC_FAUCET_REMOTE;
  if (!faucetRemote) {
    throw new Error("faucet remote address is undefined");
  }

  console.log("sending coins to %s on %s", address, faucetRemote);

  return fetch(faucetRemote, requestOptions);
};

export const signUpSlice = createSlice({
  name: "signUp",
  initialState,
  reducers: {
    signUpState: (state, action: PayloadAction<SignUpState>) => {
      state.signUpState = action.payload
    },
    addProgress: (state, action: PayloadAction<string>) => {
      console.log("progress--->", action.payload);
      state.progress = [...state.progress, action.payload];
    },
    clearProgress: (state) => {
      state.progress = [];
    }
  },
  extraReducers(builder) {
    builder.addCase(signUp.rejected, (state, action) => {
      action.error.message ? state.progress = [...state.progress, action.error.message] : null;
      console.error("signUp.rejected", action);
    });
  },

  selectors: {
    selectLoading: (state) => state.loading,
    selectProgress: (state) => state.progress,
    signUpStateSelector: (state) => state.signUpState,
  },
});

export const { addProgress, signUpState, clearProgress } = signUpSlice.actions;

export const { selectLoading, selectProgress, signUpStateSelector } = signUpSlice.selectors;
