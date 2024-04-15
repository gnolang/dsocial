import { FlatList, StyleSheet } from "react-native";
import FollowsItem from "./follows-item";
import { Following } from "@gno/types";
import Text from "@gno/components/text";

interface Props {
  data: Following[];
  onPress: (item: Following) => void;
}

function FollowsList({ data, onPress }: Props) {
  return (
    <FlatList
      style={styles.flatList}
      data={data}
      contentInsetAdjustmentBehavior="automatic"
      renderItem={({ item }) => <FollowsItem item={item} onPress={onPress} />}
      ListEmptyComponent={<Text.Body>No data</Text.Body>}
    />
  );
}

const styles = StyleSheet.create({
  flatList: {
    flex: 1,
    marginTop: 16,
    width: "100%",
  },
});

export default FollowsList;
