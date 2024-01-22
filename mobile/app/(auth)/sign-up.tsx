import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import TextInput from "components/textinput";
import Button from "components/button";
import Spacer from "components/spacer";
import * as Clipboard from "expo-clipboard";
import { useGno } from "@gno/hooks/use-gno";
import { useAuth } from "context/auth";
import SeedBox from "components/seedbox";

export default function Page() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryPhrase, setRecoveryPhrase] = useState("");
  const [phrase, setPhrase] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);

  const navigation = useNavigation();
  const gno = useGno();
  const { signIn } = useAuth();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        setPhrase(await gno.generateRecoveryPhrase());
      } catch (error) {
        console.log(error);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(phrase || "");
  };

  const recoverAccount = async (override: boolean = false) => {
    if (!recoveryPhrase || !name || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      console.log("password and confirmPassword are not the same");
      return;
    }

    try {
      if (!override) {
        const hasKeyByName = await gno.hasKeyByName(name);
        if (hasKeyByName) {
          // setShowModal(true);
          return;
        }
      }

      const response = await gno.createAccount(name, recoveryPhrase, password);
      await gno.selectAccount(name);
      await gno.setPassword(password);
      console.log("createAccount response: " + response);
      signIn({ name, password, pubKey: response.pubKey, address: response.address });
      // navigation.navigate(RoutePath.Home);
    } catch (error) {
      setError(JSON.stringify(error));
      console.log("create account error: ", JSON.stringify(error));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Sign Up your account</Text>
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
          <Button.TouchableOpacity title="Import" onPress={() => recoverAccount()} variant="primary" />
        </View>
      </View>
    </View>
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
