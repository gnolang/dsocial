import { PayloadAction, createAsyncThunk, createSlice, loggedIn } from "@reduxjs/toolkit";
import { GnoNativeApi } from "@gnolang/gnonative";
import { ThunkExtra } from "redux/redux-provider";

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
    // await onboarding.onboard(newAccount.name, newAccount.address);
    await config.dispatch(loggedIn({ keyInfo: newAccount }));

    config.dispatch(signUpState(SignUpState.account_created))
  }

})

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
    clearProgress: (state) => { state.progress = []; }
  },
  extraReducers(builder) {
    builder.addCase(signUp.fulfilled, (state, action) => {
      // state.account = action.payload;
    });
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

export const { addProgress, signUpState } = signUpSlice.actions;

export const { selectLoading, selectProgress, signUpStateSelector } = signUpSlice.selectors;
