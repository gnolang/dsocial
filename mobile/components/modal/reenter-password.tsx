import { GRPCError } from "@gno/grpc/error";
import { ErrCode } from "@gno/api/rpc_pb";
import Alert from "@gno/components/alert";
import { Modal } from "@gno/components/modal";
import { Spacer } from "@gno/components/row";
import TextInput from "@gno/components/textinput";
import { useGno } from "@gno/hooks/use-gno";
import { useState } from "react";
import { Modal as NativeModal } from "react-native";
import Text from "../text";
import Button from "../button";

export type Props = {
  visible: boolean;
  accountName: string;
  onClose: (sucess: boolean) => void;
};

const ReenterPassword = ({ visible, accountName, onClose }: Props) => {
  const gno = useGno();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  const onConfirm = async () => {
    if (!password) return;

    try {
      setError(undefined);
      await gno.setPassword(password);
      onClose(true);
    } catch (error: any) {
      const err = new GRPCError(error);
      if (err.errCode() === ErrCode.ErrDecryptionFailed) {
        setError("Wrong password, please try again.");
      } else {
        setError(JSON.stringify(error));
      }
    }
  };

  return (
    <NativeModal visible={visible} transparent={true} animationType="slide">
      <Modal.Content>
        <Modal.Header title="Re-enter your password" onClose={() => onClose(false)} />
        <Text.BodyMedium>Please, reenter the password for the selected account.</Text.BodyMedium>
        <Spacer />
        <TextInput
          placeholder={`Password for ${accountName}'s Account`}
          error={error}
          secureTextEntry={true}
          onChangeText={setPassword}
        />
        <Spacer />
        <Alert severity="error" message={error} />
        <Spacer />
        <Button.TouchableOpacity title="Confirm" onPress={onConfirm} variant="primary" />
      </Modal.Content>
    </NativeModal>
  );
};

export default ReenterPassword;
