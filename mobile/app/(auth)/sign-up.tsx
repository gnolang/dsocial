import { StyleSheet, Text, View, Button as RNButton } from "react-native";
import React, { useEffect } from "react";
import { useNavigation } from "expo-router";
import TextInput from "components/textinput";
import Button from "components/button";
import Spacer from "components/spacer";
import * as Clipboard from "expo-clipboard";
import { useGno } from "@gno/hooks/use-gno";
import { useAuth } from "context/auth";

export default function Page() {
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phrase, setPhrase] = React.useState<string>("");
  const [error, setError] = React.useState<string | undefined>(undefined);

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

  const onCreate = async () => {
    try {
      const response = await gno.createAccount(name, phrase, password);
      if (!response) throw new Error("Failed to create account");
      await gno.selectAccount(name);
      await gno.setPassword(password);
      console.log("createAccount response: " + JSON.stringify(response));
      await gno.selectAccount(name);
      await gno.setPassword(password);
      signIn({ name, password, pubKey: response.pubKey, address: response.address });
    } catch (error) {
      setError("" + error);
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Create your account</Text>
        <View style={{ minWidth: 200, paddingTop: 8 }}>
          <Spacer />
          <TextInput placeholder="Account Name" value={name} onChangeText={setName} autoCapitalize="none" />
          <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={true} error={error} />
          <Spacer />
        </View>
        <View style={{ minWidth: 200, paddingTop: 8 }}>
          <Text>Your seed phrase:</Text>
          <Spacer />
          <Text>{phrase}</Text>
          <RNButton title="copy" onPress={copyToClipboard} />
          <Spacer />
          <Spacer space={64} />
          <Button.TouchableOpacity title="Create" onPress={onCreate} variant="primary" />
          <Spacer space={16} />
          <Button.Link title="Back" href="/landing" />
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
