import React, { useRef, useState } from "react";
import { ActivityIndicator, FlatList, Platform, StyleSheet, View, RefreshControl } from "react-native";
import { useFeed } from "@gno/hooks/use-feed";
import Alert from "@gno/components/alert";
import Layout from "@gno/components/layout";
import { Post } from "@gno/types";
import useScrollToTop from "@gno/components/utils/useScrollToTopWithOffset";
import EmptyFeedList from "@gno/components/feed/empty-feed-list";
import { Tweet } from "@gno/components/feed/tweet";

type Props = {
  totalPosts: number;
  onPress: (item: Post) => void;
  address: string;
};

const subtractOrZero = (a: number, b: number) => Math.max(0, a - b);

export default function FeedView({ totalPosts, onPress, address }: Props) {
  const pageSize = 9;
  const [startIndex, setStartIndex] = useState(subtractOrZero(totalPosts, pageSize));
  const [endIndex, setEndIndex] = useState(totalPosts);
  const [limit, setLimit] = useState(pageSize + 1);
  const [data, setData] = useState<Post[]>([]);
  const [error, setError] = useState<unknown | Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isEndReached, setIsEndReached] = useState(false);

  const feed = useFeed();
  const ref = useRef<FlatList>(null);

  useScrollToTop(ref, Platform.select({ ios: -150, default: 0 }));

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);

    await fetchData(address);

    setRefreshing(false);
  }, []);

  const handleEndReached = async () => {
    console.log("end reached", isEndReached);
    if (!isEndReached) {
      setIsEndReached(true);
      fetchData(address);
    }
  };

  const fetchData = async (address: string) => {
    setIsLoading(true);
    try {
      console.log("fetching data from %d to %d", startIndex, endIndex);
      const result = await feed.fetchFeed(address, startIndex, endIndex);
      setLimit(result.n_posts);
      setStartIndex(subtractOrZero(startIndex, pageSize));
      setEndIndex(startIndex);
      setData([...data, ...result.data]);
      console.log("startIndex: %s, limit: %s", startIndex, limit);
      setIsEndReached(endIndex <= 0);
    } catch (error: unknown | Error | any) {
      // TODO: Check if this is the correct error message to handle and if it's the correct way to handle it
      // https://github.com/gnolang/gnonative/issues/117
      if (error.message === "[unknown] invoke bridge method error: unknown: posts for userPostsAddr do not exist") {
        setData([]);
        return;
      } else {
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  };

  if (error) {
    return (
      <Layout.Container>
        <Layout.Body>
          <Alert severity="error" message="Error while fetching posts, please, check the logs." />
        </Layout.Body>
      </Layout.Container>
    );
  }

  return (
    <FlatList
      ref={ref}
      scrollToOverflowEnabled
      data={data}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={<EmptyFeedList />}
      keyExtractor={(item) => `${item.id}`}
      contentContainerStyle={styles.flatListContent}
      renderItem={({ item }) => <Tweet post={item} onPress={onPress} />}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.1}
    />
  );
}

const styles = StyleSheet.create({
  flatListContent: {
    paddingBottom: 60,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
