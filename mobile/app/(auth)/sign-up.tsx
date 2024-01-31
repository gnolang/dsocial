import { StyleSheet, Text, View, Button as RNButton } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "expo-router";
import TextInput from "components/textinput";
import Button from "components/button";
import Spacer from "components/spacer";
import { useGno } from "@gno/hooks/use-gno";
import { useAuth } from "context/auth";
import SeedBox from "components/seedbox";
import { ModalConfirm } from "components/modal";
import Alert from "components/alert";

export default function Page() {
  const [recoveryPhrase, setRecoveryPhrase] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  const navigation = useNavigation();
  const gno = useGno();
  const { signIn } = useAuth();

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener("focus", async () => {
  //     try {
  //       setPhrase(await gno.generateRecoveryPhrase());
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   });
  //   return unsubscribe;
  // }, [navigation]);

  const recoverAccount = async (override: boolean = false) => {
    setError(undefined);
    console.log("createAccount1: " + name + " " + recoveryPhrase + " " + password);

    if (!recoveryPhrase || !name || !password || !confirmPassword) return;
    console.log("createAccount2: " + name + " " + recoveryPhrase + " " + password);

    if (password !== confirmPassword) {
      console.log("createAccount3: " + name + " " + recoveryPhrase + " " + password);
      setError("Passwords do not match.");
      console.log("password and confirmPassword are not the same");
      return;
    }

    console.log("createAccount4: " + name + " " + recoveryPhrase + " " + password);
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
      console.log("createAccount response: " + response);
      signIn({ name, password, pubKey: response.pubKey, address: response.address });
    } catch (error) {
      setError("" + error);
      console.log(error);
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
            <Button.Link title="Back" href="/landing" />
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
