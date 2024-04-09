import { StyleProp, TextStyle, View } from "react-native";
import { colors } from "@gno/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../text";

interface Props {
  replyCount: number;
  style?: StyleProp<TextStyle> | undefined;
}

function RepliesLabel({ replyCount, style }: Props) {
  return (
    <View style={[style, { flexDirection: "row", gap: 8 }]}>
      <MaterialCommunityIcons name="message-reply-outline" size={16} color={colors.text.secondary} />
      <Text.Caption1 style={{ color: colors.text.secondary }}>{replyCount} replies</Text.Caption1>
    </View>
  );
}

export default RepliesLabel;
