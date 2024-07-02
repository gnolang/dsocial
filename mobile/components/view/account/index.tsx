import { useMemo } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "@gno/components/text";
import Layout from "@gno/components/layout";
import { colors } from "@gno/styles/colors";
import Button from "@gno/components/button";
import { Following, Post, User } from "@gno/types";
import FeedView from "../feed/feed-view";

interface Props {
  onPressFollowing: () => void;
  onPressFollowers: () => void;
  onPressFollow: (address: string) => void;
  onPressUnfollow: (address: string) => void;
  onPressPost: (post: Post) => void;
  onGnod: (post: Post) => void;
  user: User;
  currentUser: User;
  followers: Following[];
  following: Following[];
  totalPosts: number;
}

function AccountView(props: Props) {
  const {
    onPressFollowing,
    onPressFollowers,
    onPressFollow,
    onPressUnfollow,
    onPressPost,
    onGnod,
    user,
    following,
    followers,
    currentUser,
    totalPosts,
  } = props;
  const accountName = user.name;

  const isFollowed = useMemo(() => followers.find((f) => f.address === currentUser.address) != null, [user, followers]);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.banner}>
          <Image source={{ uri: "https://www.gravatar.com/avatar/tmp" }} style={styles.avatar} />
        </View>

        <View style={styles.followButtonRow}>
          {isFollowed ? (
            <Button.TouchableOpacity
              onPress={() => onPressUnfollow(user.address)}
              variant="primary"
              title="Unfollow"
              style={{ width: 100 }}
            />
          ) : (
            <Button.TouchableOpacity
              onPress={() => onPressFollow(user.address)}
              variant="primary"
              title="Follow"
              style={{ width: 100 }}
            />
          )}
        </View>

        <View style={{ width: "100%", marginHorizontal: 16, gap: 8 }}>
          <Text.Title>{accountName}</Text.Title>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <TouchableOpacity onPress={onPressFollowers} style={{ flexDirection: "row", gap: 4 }}>
              <Text.Body style={{ fontWeight: "bold" }}>{followers.length}</Text.Body>
              <Text.Body>Followers</Text.Body>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPressFollowing} style={{ flexDirection: "row", gap: 4, paddingLeft: 8 }}>
              <Text.Body>Following</Text.Body>
              <Text.Body style={{ fontWeight: "bold" }}>{following.length}</Text.Body>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1, width: "100%", paddingHorizontal: 16, paddingTop: 8 }}>
          <Text.Body>Posts</Text.Body>
          <View style={{ height: 1, backgroundColor: colors.grayscale[200] }} />
          <FeedView totalPosts={totalPosts} onPress={onPressPost} onGnod={onGnod} address={user.address} type="userPosts" />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginLeft: 16,
  },
  container: {
    height: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    backgroundColor: colors.grayscale[100],
  },
  banner: { width: "100%", height: 100, backgroundColor: colors.grayscale[200] },
  followButtonRow: { width: "100%", alignItems: "flex-end", paddingTop: 16, paddingRight: 16 },
});

export default AccountView;
