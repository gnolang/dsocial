import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { useRouter, useNavigation } from "expo-router";
import Button from "@gno/components/button";
import Layout from "@gno/components/layout";
import SideMenuAccountList from "@gno/components/list/account/account-list";
import ReenterPassword from "@gno/components/modal/reenter-password";
import { Spacer } from "@gno/components/row";
import Ruller from "@gno/components/row/Ruller";
import Text from "@gno/components/text";
import { useGno } from "@gno/hooks/use-gno";
import { loggedIn, useAppDispatch } from "@gno/redux";
import { KeyInfo } from "@gno/api/gnonativetypes_pb";

export default function Root() {
  const route = useRouter();

  const [accounts, setAccounts] = useState<KeyInfo[]>([]);
  const [loading, setLoading] = useState<string | undefined>(undefined);
  const [reenterPassword, setReenterPassword] = useState<KeyInfo | undefined>(undefined);

  const gno = useGno();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        setLoading("Loading accounts...");

        const response = await gno.listKeyInfo();
        setAccounts(response);
      } catch (error: unknown | Error) {
        console.error(error);
      } finally {
        setLoading(undefined);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const onChangeAccountHandler = async (keyInfo: KeyInfo) => {
    try {
      setLoading("Changing account...");
      const response = await gno.selectAccount(keyInfo.name);

      setLoading(undefined);

      if (!response.hasPassword) {
        setReenterPassword(keyInfo);
        return;
      }

      dispatch(loggedIn(keyInfo));
      setTimeout(() => route.replace("/home"), 500);
    } catch (error: unknown | Error) {
      setLoading(error?.toString());
      console.log(error);
    }
  };

  const onCloseReenterPassword = async (sucess: boolean) => {
    if (sucess && reenterPassword) {
      dispatch(loggedIn(reenterPassword));
      setTimeout(() => route.replace("/home"), 500);
    }
    setReenterPassword(undefined);
  };

  if (loading) {
    return (
      <Layout.Container>
        <Layout.Body>
          <Text.Title>{loading}</Text.Title>
        </Layout.Body>
      </Layout.Container>
    );
  }

  return (
    <>
      <Layout.Container>
        <Layout.BodyAlignedBotton>
          <ScrollView>
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
            <Button.Link title="Sign up" href="sign-up" />
            <Spacer />
            <Button.Link title="Import Account" href="/sign-in" variant="tertiary" />
          </ScrollView>
        </Layout.BodyAlignedBotton>
      </Layout.Container>
      {reenterPassword ? (
        <ReenterPassword visible={Boolean(reenterPassword)} accountName={reenterPassword.name} onClose={onCloseReenterPassword} />
      ) : null}
    </>
  );
}
