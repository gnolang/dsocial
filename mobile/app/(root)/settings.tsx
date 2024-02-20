import { StyleSheet, View } from "react-native";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { useGno } from "@gno/hooks/use-gno";
import { logedOut, useAppDispatch } from "@gno/redux";
import Button from "@gno/components/button";
import useOnboarding from "@gno/hooks/use-onboarding";
import { KeyInfo } from "@gno/api/gnonativetypes_pb";
import Layout from "@gno/components/layout";
import Text from "@gno/components/text";
import Spacer from "@gno/components/spacer";
import { LoadingModal } from "@gno/components/loading";

export default function Page() {
  const [activeAccount, setActiveAccount] = useState<KeyInfo | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const gno = useGno();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const onboarding = useOnboarding();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        const account = await gno.getActiveAccount();
        setActiveAccount(account.key);

        const chainId = await gno.getChainID();
        const remote = await gno.getRemote();
        console.log("chainId: " + chainId);
        console.log("remote: " + remote);
      } catch (error: unknown | Error) {
        console.log(error);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const onboard = async () => {
    if (!activeAccount) {
      console.log("No active account");
      return;
    }
    setLoading(true);
    try {
      await onboarding.onboard(activeAccount?.name, activeAccount?.address);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const onDeleteAccount = async () => {
    router.push("settings/remove-account");
  };

  return (
    <>
      <Layout.Container>
        <Layout.Body>
          <>
            <View>
              <Text.HeaderSubtitle>Active Account:</Text.HeaderSubtitle>
              <Text.Body style={{ fontSize: 14 }}>
                {activeAccount ? JSON.stringify(activeAccount) : "No active account."}
              </Text.Body>
            </View>

            <View>
              <Button.TouchableOpacity
                title="Logout"
                onPress={() => dispatch(logedOut())}
                style={styles.logout}
                variant="primary-red"
              />
              <Spacer />
              <Button.TouchableOpacity title="Onboard" onPress={onboard} variant="primary" />
              <Button.TouchableOpacity
                title="Delete Account"
                onPress={onDeleteAccount}
                style={styles.logout}
                variant="primary-red"
              />
            </View>
          </>
        </Layout.Body>
      </Layout.Container>
      <LoadingModal visible={loading} />
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
  logout: {
    color: "#007AFF",
    marginTop: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
});
