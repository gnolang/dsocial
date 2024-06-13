import { ActivityIndicator, FlatList, Platform, StyleSheet, View, Alert as RNAlert, SafeAreaView } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { useFeed } from "@gno/hooks/use-feed";
import Layout from "@gno/components/layout";
import useScrollToTop from "@gno/components/utils/useScrollToTopWithOffset";
import Button from "@gno/components/button";
import { Post } from "@gno/types";
import { selectAccount, setPostToReply, useAppDispatch, useAppSelector } from "@gno/redux";
import Alert from "@gno/components/alert";
import { FeedView } from "@gno/components/view";

export default function Page() {
  const [totalPosts, setTotalPosts] = useState(0);
  const [error, setError] = useState<unknown | Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const feed = useFeed();
  const navigation = useNavigation();
  const ref = useRef<FlatList>(null);
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectAccount);

  useScrollToTop(ref, Platform.select({ ios: -150, default: 0 }));

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      if (!user) {
        RNAlert.alert("No user found.");
        return;
      }
      setError(undefined);
      setIsLoading(true);
      try {
        const total = await feed.fetchCount(user.address);
        setTotalPosts(total);
      } catch (error) {
        RNAlert.alert("Error while fetching posts.", " " + error);
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const onPressPost = () => {
    router.push("/post");
  };

  const onPress = async (item: Post) => {
    await dispatch(setPostToReply({ post: item }));
    router.navigate({ pathname: "/post/[post_id]", params: { post_id: item.id, address: item.user.address } });
  };

  if (isLoading)
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );

  if (error)
    return (
      <Layout.Container>
        <Layout.Body>
          <Alert severity="error" message="Error while fetching posts, please, check the logs." />
        </Layout.Body>
      </Layout.Container>
    );

  if (!user) {
    return (
      <Layout.Container>
        <Layout.Body>
          <Alert severity="error" message="No user found." />
        </Layout.Body>
      </Layout.Container>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.select({ ios: 0, default: 20 }) }}>
      <View style={styles.container}>
        <FeedView totalPosts={totalPosts} onPress={onPress} address={user.address} type="userFeed" />
        <Button.TouchableOpacity title="Post" onPress={onPressPost} style={styles.post} variant="primary" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "stretch",
  },
  flatListContent: {
    paddingBottom: 60, // Adjust the value to ensure it's above the app menu
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  post: {
    position: "absolute",
    width: 60,
    height: 60,
    bottom: 40,
    right: 20,
  },
});
