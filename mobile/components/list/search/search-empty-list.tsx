import Text from "@gno/components/text";
import { View } from "react-native";

function SearchEmptyList() {
  return (
    <View>
      <Text.Body>No results found</Text.Body>
    </View>
  );
}

export default SearchEmptyList;
