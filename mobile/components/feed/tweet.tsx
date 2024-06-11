import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Post } from "../../types";
import Text from "@gno/components/text";
import RepliesLabel from "./replies-label";
import TimeStampLabel from "./timestamp-label";
import RepostButton from "./repost-button";
import { setPostToReply, useAppDispatch } from "@gno/redux";
import { useRouter } from "expo-router";
import LikeButton from "./like-button";
import { colors } from "@gno/styles/colors";
import RepostLabel from "./repost-label";

interface FeedProps {
  post?: Post;
  onPress?: (post: Post) => void;
  showFooter?: boolean;
}

const func = () => {};

export function Tweet({ post, onPress = func, showFooter = true }: FeedProps) {
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
      <RepostLabel visible={isRepost} />
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
        </View>
      </View>
      {showFooter ? (
        <View style={[styles.footer]}>
          {/* <LikeButton style={styles.reply} onPressRepost={() => onPressRepost(post)} /> */}
          <RepostButton style={styles.reply} onPressRepost={() => onPressRepost(post)} />
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
    paddingLeft: 64,
    gap: 16,
  },
  footerHighlighted: {
    marginTop: 16,
    borderTopColor: "#ccc",
    borderTopWidth: 1,
  },
  reply: { paddingLeft: 16 },
});
