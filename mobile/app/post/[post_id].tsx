import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import Text from "@gno/components/text";
import { selectPostToReply, useAppSelector } from "@gno/redux";
import Layout from "@gno/components/layout";
import TextInput from "@gno/components/textinput";
import Button from "@gno/components/button";
import Spacer from "@gno/components/spacer";
import Alert from "@gno/components/alert";
import { useGnoNativeContext } from "@gnolang/gnonative";
import { Tweet } from "@gno/components/feed/tweet";
import { FlatList, View } from "react-native";
import { Post } from "@gno/types";
import { useFeed } from "@gno/hooks/use-feed";

function Page() {
  const [replyContent, setReplyContent] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<string | undefined>(undefined);
  const [posting, setPosting] = useState<boolean>(false);
  const [thread, setThread] = useState<Post[]>([]);
  const post = useAppSelector(selectPostToReply);

  const feed = useFeed();
  const router = useRouter();
  const gno = useGnoNativeContext();

  const params = useLocalSearchParams();
  const { post_id, address } = params;

  useEffect(() => {
    fetchData();
  }, [post_id]);

  const fetchData = async () => {
    if (!post) return;

    setLoading("Loading post...");
    try {
      const thread = await feed.fetchThread(address as string, Number(post_id));
      setThread(thread.data);
    } catch (error) {
      console.error("on post screen", error);
      setError("" + error);
    } finally {
      setLoading(undefined);
    }
  };

  const onPressReply = async () => {
    if (!post) return;

    setLoading(undefined);
    setError(undefined);
    setPosting(true);

    try {
      const gasFee = "1000000ugnot";
      const gasWanted = 10000000;

      const args: Array<string> = [post.user.address, String(post.id), String(post.id), replyContent];
      for await (const response of await gno.call("gno.land/r/berty/social", "PostReply", args, gasFee, gasWanted)) {
        console.log("response ono post screen: ", response);
      }

      setReplyContent("");
      await fetchData();
    } catch (error) {
      console.error("on post screen", error);
      setError("" + error);
    } finally {
      setPosting(false);
    }
  };

  const onPressTweet = (item: Post) => {
    // TODO: on press a tweet inside the reply thread
  };

  if (!post) {
    return (
      <Layout.Container>
        <Layout.Header title="Post" iconType="back" />
        <Layout.Body>
          <Alert severity="error" message="Error while fetching posts, please, check the logs." />
        </Layout.Body>
      </Layout.Container>
    );
  }

  return (
    <Layout.Container>
      <Layout.Header title="Post" iconType="back" />
      <Layout.Body>
        <Tweet post={post} highlighted />

        <View style={{ flex: 1 }}>
          {loading ? (
            <Text.Body style={{ flex: 1, textAlign: "center", paddingTop: 42 }}>{loading}</Text.Body>
          ) : (
            <FlatList
              scrollToOverflowEnabled
              data={thread}
              keyExtractor={(item) => `${item.id}`}
              contentContainerStyle={{ width: "100%", paddingBottom: 20 }}
              renderItem={({ item }) => <Tweet post={item} onPress={onPressTweet} />}
              onEndReachedThreshold={0.1}
            />
          )}
        </View>

        <Text.Body>Replying to {post?.user.name}</Text.Body>
        <Spacer />
        <TextInput
          placeholder="Post your reply here..."
          onChangeText={setReplyContent}
          value={replyContent}
          autoCapitalize={"none"}
          textAlign="left"
          multiline
          numberOfLines={3}
          style={{ height: 80 }}
        />
        <Button.TouchableOpacity loading={posting} title="Reply" variant="primary" onPress={onPressReply} />
        <Spacer space={16} />
        <Button.TouchableOpacity title="Back" onPress={() => router.back()} variant="secondary" />
        <Alert severity="error" message={error} />
        <Spacer space={16} />
      </Layout.Body>
    </Layout.Container>
  );
}

export default Page;
