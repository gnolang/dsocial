import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Post } from "../../types";
import Text from "@gno/components/text";
import RepliesLabel from "./replies-label";
import TimeStampLabel from "./timestamp.label";

interface FeedProps {
  post: Post;
  onPress?: (post: Post) => void;
  highlighted?: boolean;
}

export function Tweet({ post, onPress = () => {}, highlighted }: FeedProps) {
  return (
    <Pressable onPress={() => onPress(post)} style={styles.container}>
      <View style={styles.body}>
        <Image source={{ uri: post.user.image }} style={styles.image} />
        <View style={styles.content}>
          <Pressable style={{ alignItems: "flex-start" }}>
            <Text.Body style={[{ fontWeight: "bold", fontSize: 16 }]}>@{post.user.name}</Text.Body>
          </Pressable>

          <Text.Body selectable>{post.post}</Text.Body>
        </View>
      </View>
      <View style={[styles.footer, highlighted ? styles.footerHighlighted : null]}>
        <TimeStampLabel timestamp={post.date} />
        <RepliesLabel replyCount={post.n_replies} style={styles.reply} />
      </View>
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
