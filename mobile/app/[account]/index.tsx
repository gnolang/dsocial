import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { AccountView } from "@gno/components/view";
import { useSearch } from "@gno/hooks/use-search";
import { Following, Post, User } from "@gno/types";
import { setPostToReply, useAppSelector } from "@gno/redux";
import { selectAccount } from "redux/features/accountSlice";
import { setFollows } from "redux/features/profileSlice";
import { useFeed } from "@gno/hooks/use-feed";
import { useUserCache } from "@gno/hooks/use-user-cache";
import ErrorView from "@gno/components/view/account/no-account-view";
import Layout from "@gno/components/layout";
import { colors } from "@gno/styles/colors";

export default function Page() {
  const { accountName } = useLocalSearchParams<{ accountName: string }>();

  const [loading, setLoading] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [following, setFollowing] = useState<Following[]>([]);
  const [followers, setFollowers] = useState<Following[]>([]);
  const [totalPosts, setTotalPosts] = useState<number>(0);

  const navigation = useNavigation();
  const feed = useFeed();
  const search = useSearch();
  const userCache = useUserCache();
  const dispatch = useDispatch();

  const currentUser = useAppSelector(selectAccount);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      await fetchData();
    });
    return unsubscribe;
  }, [accountName]);

  const fetchData = async () => {
    if (!accountName) return;

    try {
      setLoading("Loading account...");
      const response = await search.getJsonUserByName(accountName);

      if (!response) {
        setUser(undefined);
        setError(`The account '${accountName}' does not exist.`);
        return;
      } else {
        // TODO: add avatar to indexer and avoid querying on chain
        const user = await userCache.getUser(response.bech32);
        response.avatar = user.avatar;
        setUser(response);
      }

      const { followers } = await search.GetJsonFollowers(response.bech32);
      setFollowers(followers);

      const { following } = await search.GetJsonFollowing(response.bech32);
      setFollowing(following);

      const isUserFeed = response.address === currentUser?.address;
      if (isUserFeed) {
        const total = await feed.fetchCount(response.bech32);
        setTotalPosts(total);
      } else {
        // Set startIndex and endIndex to 0 to just get the n_posts.
        const r = await feed.fetchThreadPosts(response.bech32, 0, 0);
        setTotalPosts(r.n_posts);
      }

      const enrichFollows = async (follows: Following[]) => {
        for await (const item of follows) {
          item.user = await userCache.getUser(item.address);
        }
      };

      await enrichFollows(following);
      await enrichFollows(followers);

      dispatch(setFollows({ followers, following }));
    } catch (error: unknown | Error) {
      console.log(error);
    } finally {
      setLoading(undefined);
    }
  };

  const onPressFollowing = () => {
    router.navigate({ pathname: "account/following" });
  };

  const onPressFollowers = async () => {
    router.navigate({ pathname: "account/followers" });
  };

  const onPressFollow = async (address: string, callerAddress: Uint8Array) => {
    await search.Follow(address, callerAddress);

    fetchData();
  };

  const onPressUnfollow = async (address: string, callerAddress: Uint8Array) => {
    await search.Unfollow(address as string, callerAddress);

    fetchData();
  };

  const onGnod = async (post: Post) => {
    console.log("gnodding post: ", post);
    setLoading("Gnoding...");

    if (!currentUser) throw new Error("No active account");

    try {
      await feed.onGnod(post, currentUser.address);
      await fetchData();
    } catch (error) {
      console.error("Error while adding reaction: " + error);
    } finally {
      setLoading(undefined);
    }
  };

  const onPressPost = async (item: Post) => {
    await dispatch(setPostToReply({ post: item }));
    // Posts come from the indexer, the address is a bech32 address.
    router.navigate({ pathname: "/post/[post_id]", params: { post_id: item.id, address: String(item.user.address) } });
  };

  return (
    <Layout.Container>
      <Layout.Header style={{ backgroundColor: colors.grayscale[200] }} />
      {error || loading || !user || !currentUser ? (
        <ErrorView message={error} />
      ) : (
        <AccountView
          callerAddress={currentUser.address}
          user={user}
          currentUser={currentUser}
          totalPosts={totalPosts}
          following={following}
          followers={followers}
          onGnod={onGnod}
          onPressPost={onPressPost}
          onPressFollowing={onPressFollowing}
          onPressFollowers={onPressFollowers}
          onPressFollow={onPressFollow}
          onPressUnfollow={onPressUnfollow}
        />
      )}
    </Layout.Container>
  );
}
