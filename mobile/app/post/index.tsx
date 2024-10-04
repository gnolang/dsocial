import Button from "@gno/components/button";
import Layout from "@gno/components/layout";
import Spacer from "@gno/components/spacer";
import Text from "@gno/components/text";
import TextInput from "@gno/components/textinput";
import { Stack, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { broadcastTxCommit, hasParam, makeCallTxAndRedirect, selectAccount, selectQueryParams, selectQueryParamsAddress, useAppDispatch, useAppSelector } from "@gno/redux";
import * as Linking from 'expo-linking';

export default function Search() {
  const [postContent, setPostContent] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectAccount);

  // address from the url to be used in the makeCallTx
  const bech32 = useAppSelector(selectQueryParamsAddress);

  const queryParams = useAppSelector(selectQueryParams);

  useEffect(() => {
    if ( queryParams && hasParam("tx", queryParams)) {

      const signedTx = decodeURIComponent(queryParams.tx as string)
      console.log("signedTx: ", signedTx);

      try {
        setLoading(true);
        dispatch(broadcastTxCommit(signedTx)).unwrap();
        router.push("home");
      } catch (error) {
        console.error("on broadcastTxCommit", error);
        setError("" + error);
      } finally {
        setLoading(false);
      }
    } 
  }, [queryParams]);

  useEffect(() => {
    (async () => {
      if (bech32 && typeof bech32 == 'string' && postContent) {
        const argsTx = await dispatch(makeCallTxAndRedirect({ bech32, postContent })).unwrap();

        console.log("Opening Gnokey to sign the transaction, argsTx: ", argsTx.txJson);
      }
    })()
  }, [bech32]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      setPostContent("");
      if (!account) throw new Error("No active account");
    });
    return unsubscribe;
  }, [navigation]);

  const requestAddress = async () => {
    console.log("requesting address for GnokeyMobile");
    // await dispatch(requestAddressForGnokeyMobile()).unwrap();
    const callback = encodeURIComponent('tech.berty.dsocial://post');
    Linking.openURL(`land.gno.gnokey://toselect?callback=${callback}`);
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <Layout.Container>
        <Layout.BodyAlignedBotton>
          <Button.TouchableOpacity title="Cancel" onPress={() => router.back()} variant="text" style={{ width: 100 }} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <Text.Title>Let's post a message on the Gno Blockchain!</Text.Title>
            <Spacer space={24} />
            <TextInput
              placeholder="What's happening?"
              onChangeText={setPostContent}
              value={postContent}
              multiline
              numberOfLines={4}
              style={{ height: 200 }}
            />
            <Spacer space={24} />
            <Button.TouchableOpacity loading={loading} title="Post" variant="primary" onPress={requestAddress} />
            <Spacer space={48} />
          </KeyboardAvoidingView>
        </Layout.BodyAlignedBotton>
      </Layout.Container>
    </>
  );
}
