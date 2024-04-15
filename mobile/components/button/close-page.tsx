import { StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Icons from "../icons";

interface Props {
  onCloseHandler?: () => {};
  iconType?: "close" | "back";
}

function ClosePage({ onCloseHandler, iconType = "close" }: Props) {
  const router = useRouter();

  const onPress = () => {
    onCloseHandler ? onCloseHandler() : router.back();
  };

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      {iconType === "close" ? <Icons.Close /> : <Icons.ArrowLeft />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    paddingLeft: 10,
    paddingTop: 40,
  },
});

export default ClosePage;
