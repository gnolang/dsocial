import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import TextInput from "components/textinput";
import Button from "components/button";
import Spacer from "components/spacer";
import { useGno } from "@gno/hooks/use-gno";
import SeedBox from "components/seedbox";
import { ModalConfirm } from "components/modal";
import Alert from "components/alert";
import { loggedIn } from "redux/features/accountSlice";
import { useAppDispatch } from "@gno/redux";
import useOnboarding from "@gno/hooks/use-onboarding";

export default function Page() {
  const [recoveryPhrase, setRecoveryPhrase] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const dispatch = useAppDispatch();

  const gno = useGno();
  const onboarding = useOnboarding();

  const recoverAccount = async (override: boolean = false) => {
    setError(undefined);

    if (!recoveryPhrase || !name || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      console.log("password and confirmPassword are not the same");
      return;
    }

    if (!override) {
      const hasKeyByName = await gno.hasKeyByName(name);
      if (hasKeyByName) {
        setShowModal(true);
        return;
      }
    }

    try {
      console.log("createAccount: " + name + " " + recoveryPhrase + " " + password);
      const response = await gno.createAccount(name, recoveryPhrase, password);
      if (!response) throw new Error("createAccount response is null");
      await gno.selectAccount(name);
      await gno.setPassword(password);
      console.log("createAccount response: ", JSON.stringify(response));

      await onboarding.onboard(response.name, response.address);

      dispatch(loggedIn({ name, password, pubKey: response.pubKey.toString(), address: response.address.toString() }));
    } catch (error) {
      setError("" + error);
      console.log(JSON.stringify(error));
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.main}>
          <Text style={styles.title}>Import with Seed Phrase</Text>
          <View style={{ minWidth: 200, paddingTop: 8 }}>
            <Spacer />
            <SeedBox
              placeholder="Enter your seed phrase"
              value={recoveryPhrase}
              onChangeText={(value) => setRecoveryPhrase(value.trim())}
            />
            <TextInput placeholder="Account Name" value={name} onChangeText={setName} autoCapitalize="none" />
            <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={true} error={error} />
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
              error={error}
            />
            <Spacer />
          </View>
          <View style={{ minWidth: 200, paddingTop: 8 }}>
            <Alert severity="error" message={error} />
            <Spacer space={48} />
            <Button.TouchableOpacity title="Import" onPress={() => recoverAccount()} variant="primary" />
            <Spacer space={16} />
            <Button.Link title="Back" href="/" />
          </View>
        </View>
      </View>
      <ModalConfirm
        title={`Overriding ${name}'s Account`}
        message="This account name is already in use. Are you sure you want to override the existing account?"
        visible={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => recoverAccount(true)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
});
