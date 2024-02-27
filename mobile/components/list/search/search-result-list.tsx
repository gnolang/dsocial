import { FlatList, StyleSheet } from "react-native";
import SearchItem from "./search-item";

function SearchResults({ data, onPress }: { data: string[]; onPress: (item: string) => void }) {
  return (
    <FlatList
      style={styles.flatList}
      data={data}
      contentInsetAdjustmentBehavior="automatic"
      renderItem={({ item }) => <SearchItem name={item} onPress={onPress} />}
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

export default SearchResults;
