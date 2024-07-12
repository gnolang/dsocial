import {
  FlatList,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";
import Button from "@gno/components/button";
import Layout from "@gno/components/layout";
import { useAppDispatch, useAppSelector } from "@gno/redux";
import { colors } from "@gno/styles/colors";
import { clearProgress, selectProgress } from "redux/features/signupSlice";
import { ModalView } from "@gno/components/modal";
import Text from "@gno/components/text";
import { EvilIcons } from "@expo/vector-icons";

interface Props {}

function ProgressView({}: Props) {
  const [visible, setVisible] = useState(false);

  const dispatch = useAppDispatch();
  const progress = useAppSelector(selectProgress);

  const clear = async () => {
    await dispatch(clearProgress());
  };

  if (!visible) {
    return <Button.TouchableOpacity title="Console" variant="common" onPress={() => setVisible(true)} />;
  }

  return (
    <Modal animationType="slide" transparent={true}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ModalView.Content>
            <Layout.Header title="Progress" onCloseHandler={() => setVisible(false)} style={{ marginTop: 22 }} />
            <FlatList
              data={progress}
              style={styles.flatList}
              ListEmptyComponent={<Text.Caption1 style={{ flex: 1, textAlign: "center" }}>No progress yet.</Text.Caption1>}
              renderItem={({ item }) => {
                return <Text.Caption1 style={{ flex: 1, textAlign: "left" }}>{item}</Text.Caption1>;
              }}
            />
            <View style={styles.bottom}>
              <EvilIcons name="share-apple" size={24} color="black" />
              <TouchableOpacity>
                <EvilIcons name="trash" size={24} color="black" onPress={clear} />
              </TouchableOpacity>
            </View>
          </ModalView.Content>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    flex: 1,
  },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  flatList: { borderColor: colors.grayscale[200], borderWidth: 1, marginVertical: 22, borderRadius: 4 },
});

export default ProgressView;
