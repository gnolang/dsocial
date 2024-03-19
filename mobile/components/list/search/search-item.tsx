import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "@gno/components/text";

type Props = {
  name: string;
  onPress: (item: string) => void;
};

function SearchItem({ name, onPress }: Props) {
  return (
    <TouchableOpacity onPress={() => onPress(name)} style={styles.container}>
      <Image source={{ uri: "https://www.gravatar.com/avatar/tmp" }} style={{ width: 48, height: 48, borderRadius: 24 }} />
      <View style={{ paddingLeft: 8, gap: 4, flex: 1, alignItems: "flex-start" }}>
        <Text.Body style={styles.name}>@{name}</Text.Body>
        <Text.Caption1 style={styles.caption}>{name}</Text.Caption1>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "white",
    margin: 4,
    borderRadius: 16,
    padding: 8,
  },
  name: {
    fontWeight: "bold",
  },
  caption: {
    paddingTop: 4,
    textAlign: "left",
  },
});

export default SearchItem;
