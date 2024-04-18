import { StyleSheet, Text, View, Button as RNButton, ScrollView, TextInput as RNTextInput } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { router, useNavigation } from "expo-router";
import TextInput from "components/textinput";
import Button from "components/button";
import Spacer from "components/spacer";
import * as Clipboard from "expo-clipboard";
import { useGno } from "@gno/hooks/use-gno";
import { loggedIn } from "redux/features/accountSlice";
import { useAppDispatch } from "@gno/redux";
import Alert from "@gno/components/alert";
import useOnboarding from "@gno/hooks/use-onboarding";
import Layout from "@gno/components/layout";

export default function Page() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phrase, setPhrase] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<RNTextInput>(null);

  const navigation = useNavigation();
  const gno = useGno();
  const dispatch = useAppDispatch();
  const onboarding = useOnboarding();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      setName("");
      setPassword("");
      setConfirmPassword("");
			inputRef.current?.focus();
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
    setError(undefined);
    if (!name || !password) {
      setError("Please fill out all fields");
      return;
    }

    if (name.length < 6) {
      setError("Account name must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await gno.createAccount(name, phrase, password);
      if (!response) throw new Error("Failed to create account");
      console.log("createAccount response: " + JSON.stringify(response));

      await gno.selectAccount(name);
      await gno.setPassword(password);

      await gno.selectAccount(name);
      await gno.setPassword(password);
      await onboarding.onboard(response.name, response.address);

      await dispatch(loggedIn(response));
      router.push("/home");
    } catch (error) {
      setError("" + error);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout.Container>
      <Layout.Body>
        <ScrollView>
          <View style={styles.main}>
            <Text style={styles.title}>Create your account</Text>
            <View style={{ minWidth: 200, paddingTop: 8 }}>
              <Spacer />
              <TextInput
                ref={inputRef}
                placeholder="Account Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={true} />
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
              <Text>Your seed phrase:</Text>
              <Spacer />
              <Text>{phrase}</Text>
              <RNButton title="copy" onPress={copyToClipboard} />
              <Spacer />
              <Alert severity="error" message={error} />
              <Spacer space={64} />
              <Button.TouchableOpacity title="Create" onPress={onCreate} variant="primary" loading={loading} />
              <Spacer space={16} />
              <Button.TouchableOpacity title="Back" onPress={() => router.back()} variant="secondary" disabled={loading} />
            </View>
          </View>
        </ScrollView>
      </Layout.Body>
    </Layout.Container>
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
