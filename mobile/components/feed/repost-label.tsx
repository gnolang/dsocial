import { colors } from "@gno/styles/colors";
import Text from "../text";

function RepostLabel({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <Text.Caption1
      style={{
        color: colors.text.secondary,
        textAlign: "left",
        paddingBottom: 8,
      }}
    >
      you reposted this
    </Text.Caption1>
  );
}

export default RepostLabel;
