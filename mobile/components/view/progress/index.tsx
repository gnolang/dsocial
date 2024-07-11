import {
  FlatList,
  Text,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import Button from "@gno/components/button";
import Layout from "@gno/components/layout";
import { useAppSelector } from "@gno/redux";
import { colors } from "@gno/styles/colors";
import { selectProgress } from "redux/features/signupSlice";
import { ModalView } from "@gno/components/modal";

interface Props {}

function ProgressView({}: Props) {
  const progress = useAppSelector(selectProgress);
  const [visible, setVisible] = useState(false);

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
              style={{ borderColor: colors.grayscale[200], borderWidth: 1, marginVertical: 22, borderRadius: 4 }}
              ListEmptyComponent={<Text style={{ flex: 1, textAlign: "center" }}>No progress yet.</Text>}
              renderItem={({ item }) => {
                return <Text>{item}</Text>;
              }}
            />
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
});

export default ProgressView;
