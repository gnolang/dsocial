import { StyleSheet, View } from "react-native";
import Text from "../text";

function EmptyFeedList() {
  return (
    <View style={styles.container}>
      <Text.Subheadline style={styles.text}>No posts yet</Text.Subheadline>
    </View>
  );
}

export default EmptyFeedList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  text: {
    fontSize: 20,
  },
});
