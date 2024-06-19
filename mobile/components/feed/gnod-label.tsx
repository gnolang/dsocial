import { StyleProp, TextStyle, TouchableOpacity } from "react-native";
import { colors } from "@gno/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../text";
import Icons from "../icons";

interface Props {
  gnodsCount: number;
  onPress?: () => void;
  style?: StyleProp<TextStyle> | undefined;
}

function GnodLabel({ gnodsCount, style, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={[style, { flexDirection: "row", gap: 4 }]}>
      {gnodsCount > 0 ? <Icons.Gnoded /> : <Icons.Gnod />}
      <Text.Caption1 style={{ color: colors.text.secondary, marginTop: 2 }}>{gnodsCount} Gnods</Text.Caption1>
    </TouchableOpacity>
  );
}

export default GnodLabel;
