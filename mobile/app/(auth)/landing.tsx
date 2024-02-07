// order matters here
import "react-native-polyfill-globals/auto";

// Polyfill async.Iterator. For some reason, the Babel presets and plugins are not doing the trick.
// Code from here: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-3.html#caveats
(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.for("Symbol.asyncIterator");

import React, { useEffect, useState } from "react";
import Button from "components/button";
import { useGno } from "@gno/hooks/use-gno";
import { useNavigation } from "expo-router";
import { GnoAccount } from "@gno/native_modules/types";
import SideMenuAccountList from "@gno/components/list/account/account-list";
import Layout from "@gno/components/layout";
import Ruller from "@gno/components/row/Ruller";
import { Spacer } from "@gno/components/row";
import ReenterPassword from "@gno/components/modal/reenter-password";
import Text from "@gno/components/text";
import { logedIn } from "redux/features/accountSlice";
import { useAppDispatch } from "@gno/redux";

export default function Page() {
  const [accounts, setAccounts] = useState<GnoAccount[]>([]);
  const [loading, setLoading] = useState<string | undefined>(undefined);
  const [reenterPassword, setReenterPassword] = useState<GnoAccount | undefined>(undefined);

  const gno = useGno();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        const response = await gno.listKeyInfo();

        console.log("response", response);

        setAccounts(response);
      } catch (error: unknown | Error) {
        console.log(error);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const onChangeAccountHandler = async (value: GnoAccount) => {
    try {
      setLoading("Changing account...");
      const response = await gno.selectAccount(value.name);
      setLoading(undefined);
      if (!response.hasPassword) {
        setReenterPassword(value);
        return;
      }

      dispatch(logedIn({ name: value.name, password: "", pubKey: value.pubKey.toString(), address: value.address.toString() }));
    } catch (error: unknown | Error) {
      setLoading(error?.toString());
      console.log(error);
    }
  };

  const onCloseReenterPassword = async (sucess: boolean) => {
    if (sucess && reenterPassword) {
      dispatch(
        logedIn({ name: reenterPassword.name, password: "", pubKey: reenterPassword.pubKey.toString(), address: reenterPassword.address.toString() })
      );
    }
    setReenterPassword(undefined);
  };

  return (
    <>
      <Layout.Container>
        <Layout.Body>
          {accounts && accounts.length > 0 && (
            <>
              <Text.Body>Please, select one of the existing accounts to start:</Text.Body>
              <SideMenuAccountList accounts={accounts} changeAccount={onChangeAccountHandler} />
              <Spacer />
              <Ruller />
              <Spacer />
              <Text.Body>Or use one of these options:</Text.Body>
            </>
          )}

          <Spacer />
          <Button.Link title="Sign up" href="/sign-up" />
          <Spacer />
          <Button.Link title="Import Account" href="/import-account" variant="tertiary" />
        </Layout.Body>
      </Layout.Container>
      {reenterPassword ? (
        <ReenterPassword visible={Boolean(reenterPassword)} accountName={reenterPassword.name} onClose={onCloseReenterPassword} />
      ) : null}
    </>
  );
}
