import { useAppSelector } from "@gno/redux";
import { Following } from "@gno/types";
import { selectFollowing } from "redux/features/profileSlice";
import FollowModalContent from "@gno/components/view/follow";
import { useRouter } from "expo-router";

export default function FollowingPage() {
  const data = useAppSelector(selectFollowing);
  const router = useRouter();

  const onPress = (item: Following) => {
    router.navigate({ pathname: "account", params: { accountName: item.user?.name } });
  };

  return <FollowModalContent data={data} onPress={onPress} />;
}
