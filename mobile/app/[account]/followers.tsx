import { selectFollowers } from "redux/features/profileSlice";
import { useAppSelector } from "@gno/redux";
import { Following } from "@gno/types";
import FollowModalContent from "@gno/components/view/follow";

export default function FollowersPage() {
  const data = useAppSelector(selectFollowers);

  const onPress = (item: Following) => {
    // TODO: implement this function
    console.log("on press", item);
  };

  return <FollowModalContent data={data} onPress={onPress} />;
}
