import { useGno } from "@gno/hooks/use-gno";
import Alert from "components/alert";
import Button from "components/button";
import Spacer from "components/spacer";
import TextInput from "components/textinput";
import { useAuth } from "context/auth";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Page() {
  const gno = useGno();
  const [postContent, setPostContent] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  const { user } = useAuth();

  const onPost = async () => {
    try {
      const gasFee = "1000000ugnot";
      const gasWanted = 2000000;
      const args: Array<string> = ["2", "1", "1", postContent];
      for await (const response of await gno.call("gno.land/r/berty/social", "PostMessage", args, gasFee, gasWanted)) {
        console.log("response: ", response);
        console.log(Buffer.from(response.result).toString());
      }
    } catch (error) {
      console.log(error);
      setError("" + error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text>What do you want to share?</Text>
        <View style={{ minWidth: "100%", paddingTop: 8 }}>
          <TextInput
            placeholder="What's happening?"
            onChangeText={setPostContent}
            multiline
            numberOfLines={4}
            style={{ height: 100 }}
          />
          <Spacer />
          <Button.TouchableOpacity title="Post" variant="primary" onPress={onPost} />
          <Alert severity='error' message={error} />
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
