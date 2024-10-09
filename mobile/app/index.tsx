import { View } from "react-native";
import Button from "@gno/components/button";
import Layout from "@gno/components/layout";
import Ruller from "@gno/components/row/Ruller";
import Text from "@gno/components/text";
import { clearLinking, loggedIn, requestLoginForGnokeyMobile, selectAccount, selectPath, selectQueryParamsAddress, useAppDispatch, useAppSelector } from "@gno/redux";
import Spacer from "@gno/components/spacer";
import * as Application from "expo-application";
import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function Root() {
  const dispatch = useAppDispatch();
  const route = useRouter();
  const path = useAppSelector(selectPath)
  const bech32 = useAppSelector(selectQueryParamsAddress)
  const account = useAppSelector(selectAccount)

  const appVersion = Application.nativeApplicationVersion;

  useEffect(() => {
    if (account) {
      route.replace("/home");
    }
  }, [account]);

  useEffect(() => {
    if (path === "login-callback" && bech32) {
      dispatch(loggedIn({ bech32: bech32 as string }));
      dispatch(clearLinking());
      setTimeout(() => route.replace("/home"), 500);
    }
  }, [path, bech32]);



  const signinUsingGnokey = async () => {
    await dispatch(requestLoginForGnokeyMobile()).unwrap();
  };

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

          <View style={{ flex: 1 }}>
            {/* Hero copy */}
          </View>
          <Ruller />
          <Spacer />
          <Text.Caption1>Sign in using Gnokey Mobile:</Text.Caption1>
          <Button.TouchableOpacity title="Sign in" onPress={signinUsingGnokey} variant="primary" />
        </Layout.BodyAlignedBotton>
      </Layout.Container>
    </>
  );
}
