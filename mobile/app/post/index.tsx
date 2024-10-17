import Button from "@gno/components/button";
import Layout from "@gno/components/layout";
import Spacer from "@gno/components/spacer";
import Text from "@gno/components/text";
import TextInput from "@gno/components/textinput";
import { Stack, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { broadcastTxCommit, postTxAndRedirectToSign, selectAccount, selectQueryParamsTxJsonSigned, useAppDispatch, useAppSelector } from "@gno/redux";

export default function Search() {
  const [postContent, setPostContent] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectAccount);

  const txJsonSigned = useAppSelector(selectQueryParamsTxJsonSigned);

  // hook to handle the signed tx from the Gnokey and broadcast it
  useEffect(() => {
    if (txJsonSigned) {

      const signedTx = decodeURIComponent(txJsonSigned as string)
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
  }, [txJsonSigned]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      setPostContent("");
      if (!account) throw new Error("No active account");
    });
    return unsubscribe;
  }, [navigation]);

  const onPressPost = async () => {
    if (!account || !account.bech32) throw new Error("No active account: " + JSON.stringify(account));
    await dispatch(postTxAndRedirectToSign({callerAddressBech32: account.bech32, postContent})).unwrap();
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
            <Button.TouchableOpacity loading={loading} title="Post" variant="primary" onPress={onPressPost} />
            <Spacer space={48} />
          </KeyboardAvoidingView>
        </Layout.BodyAlignedBotton>
      </Layout.Container>
    </>
  );
}
