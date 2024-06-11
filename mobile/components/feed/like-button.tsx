import { StyleProp, TextStyle, TouchableOpacity } from "react-native";
import { colors } from "@gno/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../text";

interface Props {
  style?: StyleProp<TextStyle> | undefined;
  onPressRepost?: () => void;
}

function LikeButton({ style, onPressRepost }: Props) {
  return (
    <TouchableOpacity
      onPress={onPressRepost}
      style={[style, { flexDirection: "row", paddingHorizontal: 12, alignItems: "center" }]}
    >
      <MaterialCommunityIcons name="heart-outline" size={16} color={colors.text.secondary} />
      <Text.Caption1 style={{ color: colors.text.secondary }}> Enjoy</Text.Caption1>
    </TouchableOpacity>
  );
}

export default LikeButton;
