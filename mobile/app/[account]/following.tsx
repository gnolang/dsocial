import { useAppDispatch, useAppSelector, selectFollowing, setProfileAccountName } from "@gno/redux";
import { Following } from "@gno/types";
import FollowModalContent from "@gno/components/view/follow";
import { useRouter } from "expo-router";

export default function FollowingPage() {
  const data = useAppSelector(selectFollowing);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const onPress = async (item: Following) => {
    await dispatch(setProfileAccountName(item.user?.name)); 
    router.navigate({ pathname: "account" });
  };

  return <FollowModalContent data={data} onPress={onPress} />;
}
