import { ActivityIndicator, FlatList, Platform, StyleSheet, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { useFeed } from "@gno/hooks/use-feed";
import Alert from "@gno/components/alert";
import Layout from "@gno/components/layout";
import useScrollToTop from "@gno/components/utils/useScrollToTopWithOffset";
import Button from "@gno/components/button";
import FeedView from "@gno/components/view/feed";

export default function Page() {
  const [totalPosts, setTotalPosts] = useState(0);
  const [error, setError] = useState<unknown | Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const feed = useFeed();
  const navigation = useNavigation();
  const ref = useRef<FlatList>(null);

  useScrollToTop(ref, Platform.select({ ios: -150, default: 0 }));

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      setError(undefined);
      setIsLoading(true);
      try {
        const total = await feed.fetchCount();
        setTotalPosts(total);
      } catch (error) {
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

  return (
    <Layout.Container>
      <View style={styles.container}>
        <FeedView totalPosts={totalPosts} />
        <Button.TouchableOpacity title="Post" onPress={onPressPost} style={styles.post} variant="primary" />
      </View>
    </Layout.Container>
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
