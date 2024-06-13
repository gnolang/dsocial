import Button from "@gno/components/button";
import { Tweet } from "@gno/components/feed/tweet";
import Layout from "@gno/components/layout";
import TextInput from "@gno/components/textinput";
import { selectPostToReply, useAppSelector } from "@gno/redux";
import { useGnoNativeContext } from "@gnolang/gnonative";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

export default function Page() {
  const post = useAppSelector(selectPostToReply);
  const gno = useGnoNativeContext();
  const router = useRouter();

  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const onPressRepost = async () => {
    if (!post) return;

    setLoading(true);
    try {
      const gasFee = "1000000ugnot";
      const gasWanted = 10000000;

      const args: Array<string> = [post.user.address, String(post.id), replyContent];
      for await (const response of await gno.call("gno.land/r/berty/social", "RepostThread", args, gasFee, gasWanted)) {
        console.log("response ono post screen: ", response);
      }

      // delay 3s to wait for the transaction to be mined
      // TODO: replace with a better way to wait for the transaction to be mined
      await new Promise((resolve) => setTimeout(resolve, 6000));

      router.push("home");
    } catch (error) {
      console.error("on post screen", error);
      Alert.alert("Failed to repost", "" + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout.Container>
      <Layout.Header title="Repost" />
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", padding: 16 }}>
        <View style={{ flex: 4 }} />
        <Button.TouchableOpacity
          loading={loading}
          style={{ flex: 1 }}
          variant="primary"
          title="Repost"
          onPress={onPressRepost}
        ></Button.TouchableOpacity>
      </View>
      <Layout.Body>
        <TextInput
          placeholder="Add a comment"
          onChangeText={setReplyContent}
          value={replyContent}
          autoCapitalize={"none"}
          textAlign="left"
          multiline
          numberOfLines={3}
          style={{ height: 80 }}
        />

        <Tweet post={post} showFooter={false} />
      </Layout.Body>
    </Layout.Container>
  );
}
