import { formatDistanceToNow } from "date-fns";
import { colors } from "@gno/styles/colors";
import Text from "../text";

function TimeStampLabel({ timestamp }: { timestamp: string }) {
  return (
    <Text.Caption1 style={{ color: colors.text.secondary }}>
      {formatDistanceToNow(new Date(timestamp), { addSuffix: false })}
    </Text.Caption1>
  );
}

export default TimeStampLabel;
