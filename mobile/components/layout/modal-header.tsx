import { TouchableOpacity, View, StyleSheet } from "react-native";
import { useNavigation } from "expo-router";
import Icons from "../icons";

interface Props {
  children?: React.ReactNode;
}

function ModalHeader({ children, ...props }: Props) {
  const navigation = useNavigation();

  const onCloseHandler = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container} {...props}>
      <TouchableOpacity onPress={onCloseHandler}>
        <Icons.Close />
      </TouchableOpacity>
      <View style={styles.children}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 8,
  },
  children: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 32,
  },
});

export default ModalHeader;
