import { SafeAreaView, StyleSheet, View } from "react-native";
import TextInput from "../../textinput";
import { colors } from "@gno/styles/colors";
import Icons from "../../icons";

type Props = {
  onChangeText: (text: string) => void;
};

const SearchBox = ({ onChangeText }: Props) => {
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Search"
          placeholderTextColor={colors.text.placeholder}
          onChangeText={onChangeText}
        />
        <Icons.Search color={colors.icon.default} />
      </View>
    </SafeAreaView>
  );
};

export default SearchBox;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.default,
    borderRadius: 8,
    padding: 8,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
  },
});
