import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation, useRouter } from "expo-router";
import Button from "@gno/components/button";
import Layout from "@gno/components/layout";
import SideMenuAccountList from "@gno/components/list/account/account-list";
import ReenterPassword from "@gno/components/modal/reenter-password";
import Ruller from "@gno/components/row/Ruller";
import Text from "@gno/components/text";
import { loggedIn, useAppDispatch } from "@gno/redux";
import { KeyInfo } from "@buf/gnolang_gnonative.bufbuild_es/gnonativetypes_pb";
import { useGnoNativeContext } from "@gnolang/gnonative";
import Spacer from "@gno/components/spacer";
import * as Application from "expo-application";
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

GoogleSignin.configure({
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!,
});

export default function Root() {
  const route = useRouter();

  const [accounts, setAccounts] = useState<KeyInfo[]>([]);
  const [loading, setLoading] = useState<string | undefined>(undefined);
  const [reenterPassword, setReenterPassword] = useState<KeyInfo | undefined>(undefined);

  const { gnonative } = useGnoNativeContext();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const appVersion = Application.nativeApplicationVersion;

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        setLoading("Loading accounts...");

        const response = await gnonative.listKeyInfo();
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
      const response = await gnonative.selectAccount(keyInfo.name);

      setLoading(undefined);

      if (!response.hasPassword) {
        setReenterPassword(keyInfo);
        return;
      }

      await dispatch(loggedIn({ keyInfo }));
      setTimeout(() => route.replace("/home"), 500);
    } catch (error: unknown | Error) {
      setLoading(error?.toString());
      console.log(error);
    }
  };

  const onCloseReenterPassword = async (sucess: boolean) => {
    if (sucess && reenterPassword) {
      await dispatch(loggedIn({ keyInfo: reenterPassword }));
      setTimeout(() => route.replace("/home"), 500);
    }
    setReenterPassword(undefined);
  };

  const _signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('userInfo', userInfo);

      const tokens = await GoogleSignin.getTokens()
      console.log('tokens', tokens);
    } catch (error) {
      console.log(error);
    }
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
          <View style={{ alignItems: "center" }}>
            <Text.Title>dSocial</Text.Title>
            <Text.Body>Decentralized Social Network</Text.Body>
            <Text.Body>Powered by GnoNative</Text.Body>
            <Text.Caption1>v{appVersion}</Text.Caption1>
          </View>

          <ScrollView style={{ marginTop: 24 }}>
            {accounts && accounts.length > 0 && (
              <>
                <Text.Caption1>Please, select one of the existing accounts to start:</Text.Caption1>
                <SideMenuAccountList accounts={accounts} changeAccount={onChangeAccountHandler} />
                <Spacer />
              </>
            )}
            <Spacer />
          </ScrollView>
          <Ruller />
          <Spacer />
          <Text.Caption1>Or create a new account:</Text.Caption1>
          <Button.Link title="Sign up" href="sign-up" />
          <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={_signIn}
          // disabled={isInProgress}
          />

          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={5}
            style={styles.button}
            onPress={async () => {
              try {
                const credential = await AppleAuthentication.signInAsync({
                  requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                  ],
                });
                // signed in
                console.log('credential', credential);
              } catch (e: any) {
                if (e.code === 'ERR_REQUEST_CANCELED') {
                  // handle that the user canceled the sign-in flow
                } else {
                  // handle other errors
                }
              }
            }}
          />


        </Layout.BodyAlignedBotton>
      </Layout.Container>
      {reenterPassword ? (
        <ReenterPassword visible={Boolean(reenterPassword)} accountName={reenterPassword.name} onClose={onCloseReenterPassword} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 44,
  },
});
