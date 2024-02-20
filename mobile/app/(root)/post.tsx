import { KeyInfo } from "@gno/api/gnonativetypes_pb";
import { useGno } from "@gno/hooks/use-gno";
import Alert from "components/alert";
import Button from "components/button";
import Spacer from "components/spacer";
import TextInput from "components/textinput";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Page() {
  const gno = useGno();
  const navigation = useNavigation();

  const [postContent, setPostContent] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<KeyInfo | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        const response = await gno.getActiveAccount();
        if (!response.key) throw new Error("No active account");
        setAccount(response.key);
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
      const gasWanted = 2000000;
      const args: Array<string> = [postContent];
      for await (const response of await gno.call("gno.land/r/berty/social", "PostMessage", args, gasFee, gasWanted)) {
        console.log("response: ", response);
      }
      setPostContent("");
      router.push("home");
    } catch (error) {
      console.log(error);
      setError("" + error);
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <View style={styles.container}>
        <View style={styles.main}>
          <Text>No active account. Please refresh the app.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Spacer space={16} />
        <Text>What do you want to share, {account.name}?</Text>
        <View style={{ minWidth: "100%", paddingTop: 8 }}>
          <TextInput
            placeholder="What's happening?"
            onChangeText={setPostContent}
            multiline
            numberOfLines={4}
            style={{ height: 100 }}
          />
          <Spacer />
          <Button.TouchableOpacity loading={loading} title="Post" variant="primary" onPress={onPost} />
          <Alert severity="error" message={error} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
});
