import { useAppSelector } from "@gno/redux";
import { Following } from "@gno/types";
import { selectFollowing } from "redux/features/profileSlice";
import FollowModalContent from "@gno/components/view/follow";

export default function FollowingPage() {
  const data = useAppSelector(selectFollowing);

  const onPress = (item: Following) => {
    // TODO: implement this function
    console.log("on press", item);
  };

  return <FollowModalContent data={data} onPress={onPress} />;
}
