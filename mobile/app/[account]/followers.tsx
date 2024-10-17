import { selectFollowers, setProfileAccountName } from "redux/features/profileSlice";
import { useAppDispatch, useAppSelector } from "@gno/redux";
import { Following } from "@gno/types";
import FollowModalContent from "@gno/components/view/follow";
import { useRouter } from "expo-router";

export default function FollowersPage() {
  const data = useAppSelector(selectFollowers);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const onPress = async (item: Following) => {
    await dispatch(setProfileAccountName(item.user?.name)); 
    router.navigate({ pathname: "account"});
  };

  return <FollowModalContent data={data} onPress={onPress} />;
}
