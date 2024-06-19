import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Post } from "../../types";
import Text from "@gno/components/text";
import RepliesLabel from "./replies-label";
import TimeStampLabel from "./timestamp-label";
import RepostButton from "./repost-button";
import { setPostToReply, useAppDispatch } from "@gno/redux";
import { useRouter } from "expo-router";
import RepostLabel from "./repost-label";
import { TweetRepost } from "./tweet-repost";
import GnodLabel from "./gnod-label";

interface FeedProps {
  post?: Post;
  onPress?: (post: Post) => void;
  onGnod?: (post: Post) => void;
  showFooter?: boolean;
}

const func = () => {};

export function Tweet({ post, onPress = func, onGnod = func, showFooter = true }: FeedProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isRepost = Boolean(post && post.parent_id > 0);

  const onPressRepost = async (item: Post) => {
    await dispatch(setPostToReply({ post: item }));
    router.navigate({ pathname: "/repost" });
  };

  const onPressName = async () => {
    router.navigate({ pathname: "account", params: { accountName: post?.user.name } });
  };

  if (!post) {
    return null;
  }

  return (
    <Pressable onPress={() => onPress(post)} style={styles.container}>
      <RepostLabel post={post} />
      <View style={styles.body}>
        <Image source={{ uri: post.user.image }} style={styles.image} />
        <View style={styles.content}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable style={{ flexDirection: "row", alignItems: "center" }} onPress={onPressName}>
              <Text.Body style={[{ fontWeight: "bold", fontSize: 16, paddingRight: 8 }]}>@{post.user.name}</Text.Body>
              <TimeStampLabel timestamp={post.date} />
            </Pressable>
          </View>

          <Text.Body selectable>{post.post}</Text.Body>
          {isRepost ? <TweetRepost post={post.parent_post} onPress={onPress} showFooter={false} /> : null}
        </View>
      </View>
      {showFooter ? (
        <View style={[styles.footer]}>
          <GnodLabel style={styles.reply} post={post} onGnod={onGnod} />
          <RepostButton style={styles.reply} post={post} onPressRepost={onPressRepost} />
          <RepliesLabel replyCount={post.n_replies} style={styles.reply} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  body: {
    flexDirection: "row",
    gap: 16,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  content: {
    gap: 4,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    paddingTop: 12,
    paddingLeft: 44,
    gap: 16,
  },
  footerHighlighted: {
    marginTop: 16,
    borderTopColor: "#ccc",
    borderTopWidth: 1,
  },
  reply: { paddingLeft: 16 },
});
