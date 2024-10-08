import {
  StyleSheet,
  View,
  Button as RNButton,
  ScrollView,
  TextInput as RNTextInput,
  Alert as RNAlert,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { router, useNavigation } from "expo-router";
import TextInput from "components/textinput";
import Button from "components/button";
import Spacer from "components/spacer";
import * as Clipboard from "expo-clipboard";
import { loggedIn, useAppDispatch, useAppSelector } from "@gno/redux";
import Alert from "@gno/components/alert";
import Layout from "@gno/components/layout";
import { useGnoNativeContext } from "@gnolang/gnonative";
import {
  SignUpState,
  clearSignUpState,
  existingAccountSelector,
  newAccountSelector,
  onboarding,
  signUp,
  signUpStateSelector,
} from "redux/features/signupSlice";
import { ProgressViewModal } from "@gno/components/view/progress";
import Text from "@gno/components/text";
import { MaterialIcons } from "@expo/vector-icons";

export default function Page() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phrase, setPhrase] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<RNTextInput>(null);

  const navigation = useNavigation();
  const { gnonative } = useGnoNativeContext();
  const dispatch = useAppDispatch();
  const signUpState = useAppSelector(signUpStateSelector);
  const newAccount = useAppSelector(newAccountSelector);
  const existingAccount = useAppSelector(existingAccountSelector);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      setName("");
      setPassword("");
      setConfirmPassword("");
      setError(undefined);
      dispatch(clearSignUpState());
      inputRef.current?.focus();
      try {
        setPhrase(await gnonative.generateRecoveryPhrase());
      } catch (error) {
        console.log(error);
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    (async () => {
      console.log("signUpState ->", signUpState);

      if (signUpState === SignUpState.user_exists_on_blockchain_and_local_storage) {
        setError(
          "This name is already registered on the blockchain and on this device. Please choose another name or press Back for a normal sign in."
        );
        return;
      }
      if (signUpState === SignUpState.user_already_exists_on_blockchain) {
        setError("This name is already registered on the blockchain. Please, choose another name.");
        return;
      }
      if (signUpState === SignUpState.user_already_exists_on_blockchain_under_different_name) {
        setError(
          "This account is already registered on the blockchain under a different name. Please press Back and sign up again with another Seed Phrase, or for a normal sign in with a different account if available."
        );
        return;
      }
      if (signUpState === SignUpState.user_exists_only_on_local_storage) {
        setError(
          "This name is already registered locally on this device but NOT on chain. If you want to register your account on the Gno Blockchain, please press Create again. Your seed phrase will be the same."
        );
        return;
      }
      if (signUpState === SignUpState.user_exists_under_differente_key) {
        setError(
          "This name is already registered locally and on the blockchain under a different key. Please choose another name."
        );
        return;
      }
      if (signUpState === SignUpState.account_created && newAccount) {
        router.push("/home");
      }
    })();
  }, [signUpState, newAccount]);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(phrase || "");
  };

  const onCreate = async () => {
    dispatch(clearSignUpState());
    setError(undefined);
    if (!name || !password) {
      setError("Please fill out all fields");
      return;
    }

    // Use the same regex and error message as r/demo/users
    if (!name.match(/^[a-z]+[_a-z0-9]{5,16}$/)) {
      setError("Account name must be at least 6 characters, lowercase alphanumeric with underscore");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (signUpState === SignUpState.user_exists_only_on_local_storage && existingAccount) {
      await gnonative.activateAccount(name);
      await gnonative.setPassword(password, existingAccount.address);
      await dispatch(onboarding({ account: existingAccount })).unwrap();
      return;
    }

    try {
      setLoading(true);
      await dispatch(signUp({ name, password, phrase })).unwrap();
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
            <Text.Title style={styles.title}>Create your account</Text.Title>
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
              <Text.Caption1>Your seed phrase:</Text.Caption1>
              <Spacer />
              <Text.Caption1>{phrase}</Text.Caption1>
              <RNButton title="copy" onPress={copyToClipboard} />
              <Spacer />
              <Alert severity="error" message={error} />
              <Spacer />
              <Button.TouchableOpacity title="Create" onPress={onCreate} variant="primary" loading={loading} />
              <Spacer space={16} />
              <Button.TouchableOpacity title="Back" onPress={() => router.back()} variant="secondary" disabled={loading} />
            </View>
          </View>
          <Spacer space={16} />
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={{ flexDirection: "row", alignItems: "center" }}>
              <Text.Caption1 style={{ paddingRight: 4 }}>Show Progress</Text.Caption1>
              <MaterialIcons name="history" size={18} />
            </TouchableOpacity>
          </View>
        </ScrollView>
        <ProgressViewModal visible={modalVisible} onRequestClose={() => setModalVisible(false)} />
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
  footer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
