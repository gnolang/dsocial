import { KeyInfo } from "@buf/gnolang_gnonative.bufbuild_es/gnonativetypes_pb";
import Alert from "@gno/components/alert";
import Button from "@gno/components/button";
import Layout from "@gno/components/layout";
import Spacer from "@gno/components/spacer";
import Text from "@gno/components/text";
import TextInput from "@gno/components/textinput";
import { useGnoNativeContext } from "@gnolang/gnonative";
import { Stack, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

export default function Search() {
  const [postContent, setPostContent] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const gno = useGnoNativeContext();
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      setPostContent("");
      try {
        const response = await gno.getActiveAccount();
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
      for await (const response of await gno.call("gno.land/r/berty/social", "PostMessage", args, gasFee, gasWanted)) {
        console.log("response ono post screen: ", response);
      }
      setPostContent("");
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
          <Spacer space={24} />
          <Button.TouchableOpacity title="Back" onPress={() => router.back()} variant="secondary" />
          <Alert severity="error" message={error} />
        </Layout.BodyAlignedBotton>
      </Layout.Container>
    </>
  );
}

const styles = StyleSheet.create({
  centerScreen: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
