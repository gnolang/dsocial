import { StyleProp, TextStyle, TouchableOpacity } from "react-native";
import { colors } from "@gno/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../text";

interface Props {
  gnodsCount: number;
  onPress?: () => void;
  style?: StyleProp<TextStyle> | undefined;
}

function GnodLabel({ gnodsCount, style, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={[style, { flexDirection: "row", gap: 8 }]}>
      <MaterialCommunityIcons name="message-reply-outline" size={16} color={colors.text.secondary} />
      <Text.Caption1 style={{ color: colors.text.secondary }}>{gnodsCount} Gnods</Text.Caption1>
    </TouchableOpacity>
  );
}

export default GnodLabel;
