import { StyleProp, TextStyle, TouchableOpacity } from "react-native";
import { colors } from "@gno/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../text";
import { Post } from "@gno/types";

interface Props {
  style?: StyleProp<TextStyle> | undefined;
  onPressRepost: (post: Post) => void;
  post: Post;
}

function RepostButton({ style, onPressRepost, post }: Props) {
  const onPress = () => {
    if (post.parent_post) {
      onPressRepost(post.parent_post);
    } else {
      onPressRepost(post);
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={[style, { flexDirection: "row", paddingHorizontal: 12, alignItems: "center" }]}>
      <MaterialCommunityIcons name="arrow-u-left-top" size={16} color={colors.text.secondary} />
      <Text.Caption1 style={{ color: colors.text.secondary }}>Repost</Text.Caption1>
    </TouchableOpacity>
  );
}

export default RepostButton;
