import { selectFollowers } from "redux/features/profileSlice";
import { useAppSelector } from "@gno/redux";
import { Following } from "@gno/types";
import FollowModalContent from "@gno/components/view/follow";
import { useRouter } from "expo-router";

export default function FollowersPage() {
  const data = useAppSelector(selectFollowers);
  const router = useRouter();

  const onPress = (item: Following) => {
    router.navigate({ pathname: "account", params: { accountName: item.user?.name } });
  };

  return <FollowModalContent data={data} onPress={onPress} />;
}
