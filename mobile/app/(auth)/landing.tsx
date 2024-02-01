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
import { useAuth } from "context/auth";
import ReenterPassword from "@gno/components/modal/reenter-password";
import Text from "@gno/components/text";

export default function Page() {
  const [accounts, setAccounts] = useState<GnoAccount[]>([]);
  const [loading, setLoading] = useState<string | undefined>(undefined);
  const [reenterPassword, setReenterPassword] = useState<GnoAccount | undefined>(undefined);

  const gno = useGno();
  const navigation = useNavigation();
  const { signIn } = useAuth();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        // setLoading('Loading accounts...');
        const response = await gno.listKeyInfo();

        console.log("response", response);

        setAccounts(response);
        // setLoading(undefined);
      } catch (error: unknown | Error) {
        // setLoading(error?.toString());
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

      signIn({ name: value.name, password: "", pubKey: value.pubKey, address: value.address });
    } catch (error: unknown | Error) {
      setLoading(error?.toString());
      console.log(error);
    }
  };

  const onCloseReenterPassword = async (sucess: boolean) => {
    if (sucess && reenterPassword) {
      signIn({ name: reenterPassword.name, password: "", pubKey: reenterPassword.pubKey, address: reenterPassword.address });
    }
    setReenterPassword(undefined);
  };

  return (
    <>
      <Layout.Container>
        <Layout.Body>
          {/* <Text style={styles.subtitle}>Experimental social dApp on Gno.land</Text> */}
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
          <Button.Link title="Sign in" href="/sign-in" />
          <Spacer />
          <Button.Link title="Sign Up" href="/sign-up" variant="tertiary" />
        </Layout.Body>
      </Layout.Container>
      {reenterPassword ? (
        <ReenterPassword visible={Boolean(reenterPassword)} accountName={reenterPassword.name} onClose={onCloseReenterPassword} />
      ) : null}
    </>
  );
}
