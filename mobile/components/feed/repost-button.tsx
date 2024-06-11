import { StyleProp, TextStyle, TouchableOpacity } from "react-native";
import { colors } from "@gno/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../text";

interface Props {
  style?: StyleProp<TextStyle> | undefined;
  onPressRepost?: () => void;
}

function RepostButton({ style, onPressRepost }: Props) {
  return (
    <TouchableOpacity
      onPress={onPressRepost}
      style={[style, { flexDirection: "row", paddingHorizontal: 12, alignItems: "center" }]}
    >
      <MaterialCommunityIcons name="arrow-u-left-top" size={16} color={colors.text.secondary} />
      <Text.Caption1 style={{ color: colors.text.secondary }}>Repost</Text.Caption1>
    </TouchableOpacity>
  );
}

export default RepostButton;
