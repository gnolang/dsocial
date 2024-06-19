import { StyleProp, TextStyle, TouchableOpacity } from "react-native";
import { colors } from "@gno/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../text";
import Icons from "../icons";
import { Post } from "@gno/types";

interface Props {
  onGnod: (post: Post) => void;
  post: Post;
  style?: StyleProp<TextStyle> | undefined;
}

function GnodLabel({ post, style, onGnod }: Props) {
  const isRepost = Boolean(post && post.parent_id > 0);
  const gnodsCount = isRepost ? post.parent_post?.n_gnods : post.n_gnods;

  const onPress = () => {
    if (post.parent_post) {
      onGnod(post.parent_post);
    } else {
      onGnod(post);
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={[style, { flexDirection: "row", gap: 4 }]}>
      {gnodsCount && gnodsCount > 0 ? <Icons.Gnoded /> : <Icons.Gnod />}
      <Text.Caption1 style={{ color: colors.text.secondary, marginTop: 2 }}>{gnodsCount} Gnods</Text.Caption1>
    </TouchableOpacity>
  );
}

export default GnodLabel;
