import React from "react";
import { View, Modal, StyleSheet, FlatList, TouchableOpacity, Share } from "react-native";
import { colors } from "@gno/styles/colors";
import Layout from "@gno/components/layout";
import Text from "@gno/components/text";
import { EvilIcons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  onRequestClose: () => void;
}

// TODO: reimplment this
const ProgressViewModal: React.FC<Props> = ({ visible, onRequestClose }) => {
  //const dispatch = useAppDispatch();
  const progress = ["<disabled>"]

  const clear = async () => {
    //await dispatch(clearProgress());
  };

  const share = async () => {
    await Share.share({
      message: progress.join("\n"),
    });
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onRequestClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.transparentTop}></View>
          <View style={styles.modalContent}>
            <Layout.Header title="Progress" onCloseHandler={onRequestClose} style={{ marginTop: 22 }} />
            <FlatList
              data={progress}
              style={styles.flatList}
              ListEmptyComponent={<Text.Caption1 style={{ flex: 1, textAlign: "center" }}>No progress yet.</Text.Caption1>}
              renderItem={({ item }) => {
                return <Text.Caption1 style={{ flex: 1, textAlign: "left" }}>{item}</Text.Caption1>;
              }}
            />
            <View style={styles.bottom}>
              <EvilIcons name="share-apple" size={24} color="black" onPress={share} />
              <TouchableOpacity>
                <EvilIcons name="trash" size={24} color="black" onPress={clear} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: colors.modal.backgroundOpaque,
  },
  transparentTop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  flatList: { borderColor: colors.grayscale[200], borderWidth: 1, marginVertical: 22, borderRadius: 4, height: 400 },
});

export default ProgressViewModal;
