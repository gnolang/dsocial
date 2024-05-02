import { useState } from "react";
import { useRouter } from "expo-router";
import Text from "@gno/components/text";
import { selectPostToReply, selectReplyThread, useAppSelector } from "@gno/redux";
import Layout from "@gno/components/layout";
import TextInput from "@gno/components/textinput";
import Button from "@gno/components/button";
import Spacer from "@gno/components/spacer";
import Alert from "@gno/components/alert";
import { useGno } from "@gnolang/gnonative/src/hooks/use-gno";
import { Tweet } from "@gno/components/feed/tweet";
import { FlatList } from "react-native";
import { Post } from "@gno/types";

function Page() {
  const [postContent, setPostContent] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const post = useAppSelector(selectPostToReply);
  const thread = useAppSelector(selectReplyThread);
  const router = useRouter();
  const gno = useGno();

  const onPressReply = async () => {
    if (!post) return;

    setLoading(true);
    setError(undefined);

    try {
      const gasFee = "1000000ugnot";
      const gasWanted = 10000000;

      const args: Array<string> = [post.user.address, String(post.id), String(post.id), postContent];
      for await (const response of await gno.call("gno.land/r/berty/social", "PostReply", args, gasFee, gasWanted)) {
        console.log("response ono post screen: ", response);
      }

      setPostContent("");
      router.back();
    } catch (error) {
      console.error("on post screen", error);
      setError("" + error);
    } finally {
      setLoading(false);
    }
  };

  const onPressTweet = (item: Post) => {
    // TODO: on press a tweet inside the reply thread
  };

  if (!post) return <Text.Body>Error on loading Post</Text.Body>;

  return (
    <Layout.Container>
      <Layout.Header title="Post" iconType="back" />
      <Layout.Body>
        <Tweet post={post} highlighted />

        <FlatList
          scrollToOverflowEnabled
          data={thread}
          keyExtractor={(item) => `${item.id}`}
          contentContainerStyle={{ flex: 1, height: 200, width: "100%" }}
          renderItem={({ item }) => <Tweet post={item} onPress={onPressTweet} />}
          onEndReachedThreshold={0.1}
        />

        <Spacer />
        <Text.Body>Replying to {post?.user.name}</Text.Body>
        <Spacer />
        <TextInput
          placeholder="Post your reply here..."
          onChangeText={setPostContent}
          value={postContent}
          multiline
          numberOfLines={4}
          style={{ height: 100 }}
        />
        <Spacer space={16} />
        <Button.TouchableOpacity loading={loading} title="Reply" variant="primary" onPress={onPressReply} />
        <Spacer space={16} />
        <Button.TouchableOpacity title="Back" onPress={() => router.back()} variant="secondary" />
        <Alert severity="error" message={error} />
      </Layout.Body>
    </Layout.Container>
  );
}

export default Page;
