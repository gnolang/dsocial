import { StyleSheet, Text, View, Button as RNButton, ScrollView, TextInput as RNTextInput, Alert as RNAlert } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { router, useNavigation } from "expo-router";
import TextInput from "components/textinput";
import Button from "components/button";
import Spacer from "components/spacer";
import * as Clipboard from "expo-clipboard";
import { useAppDispatch, loggedIn } from "@gno/redux";
import Alert from "@gno/components/alert";
import useOnboarding from "@gno/hooks/use-onboarding";
import Layout from "@gno/components/layout";
import { useGnoNativeContext } from "@gnolang/gnonative";

export default function Page() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phrase, setPhrase] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<RNTextInput>(null);

  const navigation = useNavigation();
  const gno = useGnoNativeContext();
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

      const result = await gno.qEval("gno.land/r/demo/users", `GetUserByName("${name}")`);
      // The result contains something like ("g1cv7yjukd8d3236fwjndztrfj0kej8323lc8rt9" std.Address)
      const demoUsersMatch = result.match(/\("(\w+)" std\.Address\)/);

      var keystoreInfoByName = null;
      try {
        keystoreInfoByName = await gno.getKeyInfoByNameOrAddress(name);
      } catch (e) {
        // TODO: Check for error other than ErrCryptoKeyNotFound(#151)
      }

      if (keystoreInfoByName) {
        if (demoUsersMatch) {
          const demoUsersAddr = demoUsersMatch[1];
          if (demoUsersAddr == await gno.addressToBech32(keystoreInfoByName.address)) {
            // TODO: Offer to do normal signin, or choose new name
            return;
          }
          else {
            // TODO: Bad case. Choose new name. (Delete name in keystore?)
            return;
          }
        }
        else {
          // TODO: Offer to onboard existing account, replace it, or choose new name
          return;
        }
      }
      else {
        if (demoUsersMatch) {
          const demoUsersAddr = demoUsersMatch[1];
          try {
            const keystoreInfoByAddr = await gno.getKeyInfoByNameOrAddress(demoUsersAddr);
            console.log("This name is already registered on the blockchain. The same key has a different name on this phone: " + keystoreInfoByAddr.name);
            // TODO: Offer to rename keystoreInfoByAddr.name to name in keystore (password check), and do signin
            return;
          } catch (e) {
            // TODO: Check for error other than ErrCryptoKeyNotFound(#151)
          }

          setError("This name is already registered on the blockchain. Please choose another.");
          return;
        }
        
        // Proceed to create the account.
      }

      const newAccount = await gno.createAccount(name, phrase, password);
      if (!newAccount) throw new Error("Failed to create account");
      console.log("createAccount response: " + JSON.stringify(newAccount));

      await gno.selectAccount(name);
      await gno.setPassword(password);
      await onboarding.onboard(newAccount.name, newAccount.address);
      const bech32 = await gno.addressToBech32(newAccount.address);
      await dispatch(loggedIn({ keyInfo: newAccount, bech32 }));
      router.push("/home");
    } catch (error) {
      RNAlert.alert("Error", "" + error);
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
            </View>
            <View style={{ minWidth: 200, paddingTop: 8 }}>
              <Text>Your seed phrase:</Text>
              <Spacer />
              <Text>{phrase}</Text>
              <RNButton title="copy" onPress={copyToClipboard} />
              <Spacer />
              <Alert severity="error" message={error} />
              <Spacer />
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
