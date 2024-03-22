import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Loading } from "@gno/components/loading";
import { AccountView } from "@gno/components/view";
import { useSearch } from "@gno/hooks/use-search";
import { Following, User } from "@gno/types";
import { useAppSelector } from "redux/store";
import { selectAccount } from "redux/features/accountSlice";
import { setFollows } from "redux/features/profileSlice";

export default function Page() {
  const { accountName } = useLocalSearchParams<{ accountName: string }>();

  const [loading, setLoading] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [following, setFollowing] = useState<Following[]>([]);
  const [followers, setFollowers] = useState<Following[]>([]);

  const navigation = useNavigation();
  const search = useSearch();
  const currentUser = useAppSelector(selectAccount);
  const dispatch = useDispatch();

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
      setUser(response);

      const followers = await search.GetJsonFollowers(response.address);
      setFollowers(followers);

      const following = await search.GetJsonFollowing(response.address);
      setFollowing(following);

      dispatch(setFollows({ followers, following, accountName }));
    } catch (error: unknown | Error) {
      console.log(error);
    } finally {
      setLoading(undefined);
    }
  };

  const onPressFollowing = () => {
    router.navigate({ pathname: "account/following" });
  };

  const onPressFollowers = () => {
    router.navigate({ pathname: "account/followers" });
  };

  const onPressFollow = async (address: string) => {
    await search.Follow(address);

    fetchData();
  };

  const onPressUnfollow = async (address: string) => {
    await search.Unfollow(address as string);

    fetchData();
  };

  if (!user || loading || !currentUser) {
    return <Loading message="Profile Loading..." />;
  }

  return (
    <AccountView
      user={user}
      currentUser={currentUser}
      following={following}
      followers={followers}
      onPressFollowing={onPressFollowing}
      onPressFollowers={onPressFollowers}
      onPressFollow={onPressFollow}
      onPressUnfollow={onPressUnfollow}
    />
  );
}
