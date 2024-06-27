import Button from "@gno/components/button";
import Layout from "@gno/components/layout";
import Spacer from "@gno/components/spacer";
import Text from "@gno/components/text";
import TextInput from "@gno/components/textinput";
import { useGnoNativeContext } from "@gnolang/gnonative";
import { Stack, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

export default function Search() {
  const [postContent, setPostContent] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const { gnonative } = useGnoNativeContext();
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      setPostContent("");
      try {
        const response = await gnonative.getActiveAccount();
        if (!response.key) throw new Error("No active account");
      } catch (error: unknown | Error) {
        console.log(error);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const onPost = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const gasFee = "1000000ugnot";
      const gasWanted = 10000000;
      const args: Array<string> = [postContent];
      for await (const response of await gnonative.call("gno.land/r/berty/social", "PostMessage", args, gasFee, gasWanted)) {
        console.log("response ono post screen: ", response);
      }
      setPostContent("");

      // delay 3s to wait for the transaction to be mined
      // TODO: replace with a better way to wait for the transaction to be mined
      await new Promise((resolve) => setTimeout(resolve, 3000));

      router.push("home");
    } catch (error) {
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
            <Button.TouchableOpacity loading={loading} title="Post" variant="primary" onPress={onPost} />
            <Spacer space={48} />
          </KeyboardAvoidingView>
        </Layout.BodyAlignedBotton>
      </Layout.Container>
    </>
  );
}
