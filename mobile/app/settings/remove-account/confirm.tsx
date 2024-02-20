import { useGno } from "@gno/hooks/use-gno";
import { useState } from "react";
import styled from "styled-components/native";
import Alert from "@gno/components/alert";
import { Spacer } from "@gno/components/row";
import { router, useLocalSearchParams } from "expo-router";
import Layout from "@gno/components/layout";
import Text from "@gno/components/text";
import Button from "@gno/components/button";

type Props = {
  accountName: string;
};

const RemoveConfirm = () => {
  const gno = useGno();
  const { accountName } = useLocalSearchParams<Props>();
  const [error, setError] = useState<string | undefined>(undefined);

  const onConfirm = async () => {
    if (!accountName) {
      setError("Account name not found");
      return;
    }

    try {
      await gno.deleteAccount(accountName, undefined, true);
      router.push("settings/remove-account");
    } catch (error) {
      setError(error?.toString());
    }
  };

  const onCancel = () => {
    router.back();
  };

  return (
    <Layout.Container>
      <Layout.Header />
      <Layout.Body>
        <Text.Title>Remove Account {accountName}</Text.Title>
        <Text.Body style={{ color: "red" }}>
          Only proceed if you wish to remove this account from your wallet. You can always recover it with your seed phrase or
          your private key.
        </Text.Body>
        <Alert severity="error" message={error} />
        <ButtonGroup>
          <Button.TouchableOpacity title="Remove" onPress={onConfirm} variant="primary-red" />
          <Spacer />
          <Button.TouchableOpacity title="Cancel" onPress={onCancel} variant="primary" />
        </ButtonGroup>
      </Layout.Body>
    </Layout.Container>
  );
};

const ButtonGroup = styled.View`
  margin-top: 24px;
  margin-left: 30px;
  margin-right: 30px;
  justify-content: space-between;
`;

export default RemoveConfirm;
