import { Modal as NativeModal } from "react-native";
import ModalHeader from "./ModalHeader";
import ModalContent from "./ModalContent";
import Button from "components/button";
import Ruller from "components/row/Ruller";
import Spacer from "components/spacer";
import Text from "components/text";

export type Props = {
  title: string;
  message: string;
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ModalConfirm = ({ visible, onClose, onConfirm, title, message }: Props) => {
  return (
    <NativeModal visible={visible} transparent={true} animationType="slide">
      <ModalContent>
        <ModalHeader title={title} onClose={onClose} />
        <Text.BodyMedium>{message}</Text.BodyMedium>
        <Spacer />
        <Button.TouchableOpacity title="Confirm" onPress={onConfirm} variant="primary-red" />
        <Ruller />
        <Button.TouchableOpacity title="Close" onPress={onClose} variant="secondary" />
      </ModalContent>
    </NativeModal>
  );
};

export default ModalConfirm;
