import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import Text from "@gno/components/text";
import { selectAccount, selectPostToReply, useAppSelector } from "@gno/redux";
import Layout from "@gno/components/layout";
import TextInput from "@gno/components/textinput";
import Button from "@gno/components/button";
import Spacer from "@gno/components/spacer";
import Alert from "@gno/components/alert";
import { useGnoNativeContext } from "@gnolang/gnonative";
import { PostRow } from "@gno/components/feed/post-row";
import { FlatList, KeyboardAvoidingView, View, Alert as RNAlert } from "react-native";
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
  const { gnonative } = useGnoNativeContext();
  const account = useAppSelector(selectAccount);

  const params = useLocalSearchParams();
  const { post_id, address } = params;

  useEffect(() => {
    fetchData();
  }, [post_id]);

  const fetchData = async () => {
    if (!post) return;

    console.log("fetching post: ", post_id, address);
    setLoading("Loading post...");
    try {
      const thread = await feed.fetchThread(address as string, Number(post_id));
      setThread(thread.data);
    } catch (error) {
      console.error("failed on [post_id].tsx screen", error);
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

    if (!account) throw new Error("No active account"); // never happens, but just in case

    try {
      const gasFee = "1000000ugnot";
      const gasWanted = 10000000;

      // Post objects comes from the indexer, address is a bech32 address
      const args: Array<string> = [String(post.user.address), String(post.id), String(post.id), replyContent];
      for await (const response of await gnonative.call("gno.land/r/berty/social", "PostReply", args, gasFee, gasWanted, account.address)) {
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

  const onPressPost = (post: Post) => {
    // TODO: on press a post inside the reply thread
  };

  const onGnod = async (post: Post) => {
    console.log("gnodding post: ", post);
    setLoading("Gnoding...");

    if (!account) throw new Error("No active account");

    try {
      await feed.onGnod(post, account.address);
      await fetchData();
    } catch (error) {
      RNAlert.alert("Error", "Error while adding reaction: " + error);
    } finally {
      setLoading(undefined);
    }
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
        <PostRow post={post} showFooter={false} />

        <View style={{ flex: 1 }}>
          {loading ? (
            <Text.Body style={{ flex: 1, textAlign: "center", paddingTop: 42 }}>{loading}</Text.Body>
          ) : (
            <FlatList
              scrollToOverflowEnabled
              data={thread}
              keyExtractor={(item) => `${item.id}`}
              contentContainerStyle={{ width: "100%", paddingBottom: 20 }}
              renderItem={({ item }) => <PostRow post={item} onPress={onPressPost} onGnod={onGnod} />}
              onEndReachedThreshold={0.1}
            />
          )}
        </View>

        <Text.Body>Replying to {post?.user.name}</Text.Body>
        <Spacer />
        <KeyboardAvoidingView behavior="padding">
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
        </KeyboardAvoidingView>
      </Layout.Body>
    </Layout.Container>
  );
}

export default Page;
