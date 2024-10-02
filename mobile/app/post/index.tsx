import Button from "@gno/components/button";
import Layout from "@gno/components/layout";
import Spacer from "@gno/components/spacer";
import Text from "@gno/components/text";
import TextInput from "@gno/components/textinput";
import { useGnoNativeContext } from "@gnolang/gnonative";
import { Stack, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { addProgress } from "redux/features/signupSlice";
import { broadcastTxCommit, requestAddressForGnokeyMobile, selectAccount, useAppDispatch, useAppSelector } from "@gno/redux";
import * as Linking from 'expo-linking';

export default function Search() {
  const [postContent, setPostContent] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const { gnonative } = useGnoNativeContext();
  const navigation = useNavigation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectAccount);

  const url = Linking.useURL();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      setPostContent("");
      try {
        if (!account) throw new Error("No active account");
      } catch (error: unknown | Error) {
        console.log(error);
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    (async () => {
      if (url) {
        const { hostname, path, queryParams } = Linking.parse(url);

        console.log("link url", url);
        console.log("link hostname", hostname);
        console.log("link path", path);
        console.log("link queryParams", queryParams);

        if (queryParams) {

          if (queryParams.address && typeof queryParams.address === "string") {
            const address = decodeURIComponent(queryParams.address)
            console.log("address: ", address);
            await makeCallTx(address)
          }

          if (queryParams.tx && typeof queryParams.tx === "string") {
            const signedTx = decodeURIComponent(queryParams.tx)
            console.log("signedTx: ", signedTx);

            try {
              setLoading(true);
              await dispatch(broadcastTxCommit(signedTx)).unwrap();
              router.push("home");
            } catch (error) {
              console.error("on broadcastTxCommit", error);
              setError("" + error);
            } finally {
              setLoading(false);
            }
          }
        }
      }
    })()
  }, [url]);

  const requestAddress = async () => {
    console.log("requesting address for GnokeyMobile");
    // await dispatch(requestAddressForGnokeyMobile()).unwrap();
    const callback = encodeURIComponent('tech.berty.dsocial://post');
    Linking.openURL(`land.gno.gnokey://toselect?callback=${callback}`);

  }

  // const broadcastTxCommit = async (signedTx: string) => {

  //   setLoading(true);
  //   setError(undefined);
  //   dispatch(addProgress(`posting a message.`))

  //   try {
  //     for await (const response of await gnonative.broadcastTxCommit(signedTx)) {
  //       const result = JSON.parse(JSON.stringify(response)).result;
  //       console.log("broadcast result:", result);
  //     }
  //     router.push("home");
  //   } catch (error) {
  //     dispatch(addProgress(`error on broadcasting a tx: ` + JSON.stringify(error)))
  //     console.error("on post screen", error);
  //     setError("" + error);
  //   } finally {
  //     setLoading(false);
  //   }

  // }

  const makeCallTx = async (bech32: string) => {
    setLoading(true);
    setError(undefined);
    dispatch(addProgress(`address ${bech32} selected. calling makeCallTx.`))

    if (!account) throw new Error("No active account"); // never happens, but just in case

    try {
      const gasFee = "1000000ugnot";
      const gasWanted = BigInt(10000000);
      const args: Array<string> = [postContent];

      const address = await gnonative.addressFromBech32(bech32);
      const argsTx = await gnonative.makeCallTx("gno.land/r/berty/social", "PostMessage", args, gasFee, gasWanted, address)

      console.log("Opening Gnokey to sign the transaction, argsTx: ", argsTx.txJson);

      setTimeout(() =>
        Linking.openURL('land.gno.gnokey://tosign?tx=' + encodeURIComponent(argsTx.txJson)), 500)

    } catch (error) {
      dispatch(addProgress(`error on makeCallTx: ` + JSON.stringify(error)))
      console.error("on post screen", error);
      setError("" + error);
    } finally {
      setLoading(false);
    }
  };

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
