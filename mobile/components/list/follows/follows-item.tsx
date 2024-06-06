import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "@gno/components/text";
import { Following } from "@gno/types";

type Props = {
  item: Following;
  onPress: (item: Following) => void;
};

function FollowsItem({ item, onPress }: Props) {
  return (
    <TouchableOpacity onPress={() => onPress(item)} style={styles.container}>
      <Image source={{ uri: "https://www.gravatar.com/avatar/tmp" }} style={{ width: 48, height: 48, borderRadius: 24 }} />
      <View style={styles.textBox}>
        <Text.Body style={styles.name}>@{item.user?.name}</Text.Body>
        <Text.Caption1 numberOfLines={1} ellipsizeMode="tail" style={styles.caption}>
          {item.address}
        </Text.Caption1>
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
  textBox: { paddingLeft: 8, gap: 4, flex: 1, alignItems: "flex-start" },
  name: {
    fontWeight: "bold",
  },
  caption: {
    paddingTop: 4,
    textAlign: "left",
  },
});

export default FollowsItem;
