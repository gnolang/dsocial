import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Post } from "@gno/types";
import Text from "@gno/components/text";
import RepliesLabel from "./replies-label";
import TimeStampLabel from "./timestamp-label";
import RepostButton from "./repost-button";
import { setPostToReply, useAppDispatch, setProfileAccountName } from "@gno/redux";
import { useRouter } from "expo-router";
import RepostLabel from "./repost-label";

interface FeedProps {
  post?: Post;
  onPress?: (post: Post) => void;
  showFooter?: boolean;
}

const func = () => {};

export function RepostRow({ post, onPress = func, showFooter = true }: FeedProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const onPressRepost = async (item: Post) => {
    await dispatch(setPostToReply({ post: item }));
    router.navigate({ pathname: "/repost" });
  };

  const onPressName = async () => {
    await dispatch(setProfileAccountName(post?.user.name)); 
    router.navigate({ pathname: "account" });
  };

  if (!post) {
    return null;
  }

  return (
    <Pressable onPress={() => onPress(post)} style={styles.container}>
      <RepostLabel post={post} />
      <View style={styles.body}>
        <View style={styles.content}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image source={{ uri: post.user.avatar }} style={styles.image} />
            <Pressable style={{ flexDirection: "row", alignItems: "center", paddingLeft: 8 }} onPress={onPressName}>
              <Text.Body style={[{ fontWeight: "bold", fontSize: 16, paddingRight: 8 }]}>@{post.user.name}</Text.Body>
              <TimeStampLabel timestamp={post.date} />
            </Pressable>
          </View>

          <Text.Body selectable>{post.post}</Text.Body>
        </View>
      </View>
      {showFooter ? (
        <View style={[styles.footer]}>
          <RepostButton style={styles.reply} post={post} onPressRepost={onPressRepost} />
          <RepliesLabel replyCount={post.n_replies} style={styles.reply} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  body: {
    flexDirection: "row",
    gap: 4,
  },
  image: {
    width: 24,
    height: 24,
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
