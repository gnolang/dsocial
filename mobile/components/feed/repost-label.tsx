import { colors } from "@gno/styles/colors";
import Text from "../text";
import { Post } from "@gno/types";

function RepostLabel({ post }: { post: Post }) {
  if (!post.repost_parent) return null;

  return (
    <Text.Caption1
      style={{
        color: colors.text.secondary,
        textAlign: "left",
        paddingBottom: 8,
      }}
    >
      reposted from @{post.repost_parent?.user.name}
    </Text.Caption1>
  );
}

export default RepostLabel;
