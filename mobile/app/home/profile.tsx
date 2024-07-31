import { Alert, StyleSheet, View } from "react-native";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { useGnoNativeContext } from "@gnolang/gnonative";
import { logedOut, useAppDispatch } from "@gno/redux";
import Button from "@gno/components/button";
import { KeyInfo } from "@buf/gnolang_gnonative.bufbuild_es/gnonativetypes_pb";
import Layout from "@gno/components/layout";
import { LoadingModal } from "@gno/components/loading";
import { AccountBalance } from "@gno/components/settings";
import Text from "@gno/components/text";
import { useSearch } from "@gno/hooks/use-search";
import { useNotificationContext } from "@gno/provider/notification-provider";
import { onboarding } from "redux/features/signupSlice";
import AvatarPicker from "@gno/components/avatar/avatar-picker";

export default function Page() {
  const [activeAccount, setActiveAccount] = useState<KeyInfo | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [chainID, setChainID] = useState("");
  const [remote, setRemote] = useState("");
  const [followersCount, setFollowersCount] = useState({ n_followers: 0, n_following: 0 });

  const { gnonative } = useGnoNativeContext();
  const search = useSearch();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const push = useNotificationContext();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        fetchAccountData();
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
      await dispatch(onboarding({ account: activeAccount })).unwrap();
      fetchAccountData();
    } catch (error) {
      console.log("Error on onboard", JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  const onPressNotification = async () => {
    if (!activeAccount) {
      console.log("No active account");
      return;
    }
    setLoading(true);
    try {
      const address_bech32 = await gnonative.addressToBech32(activeAccount?.address);
      await push.registerDevice(address_bech32);
      Alert.alert("Push notification", "You have successfully registered for push notification!");
    } catch (error) {
      console.log("Error on onPressNotification", JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountData = async () => {
    const account = await gnonative.getActiveAccount();
    const chainId = await gnonative.getChainID();
    const remote = await gnonative.getRemote();
    setActiveAccount(account.key);
    setChainID(chainId);
    setRemote(remote);

    try {
      const address = await gnonative.addressToBech32(account?.key?.address!);
      const followersCount = await search.GetJsonFollowersCount(address);

      setFollowersCount(followersCount);

      console.log("remote: %s chainId %s " + remote, chainId);
    } catch (error: unknown | Error) {
      console.log(error);
    }
  };

  const onRemoveAccount = async () => {
    router.navigate({ pathname: "account/remove" });
  };

  const onPressLogout = async () => {
    dispatch(logedOut());
  };

  return (
    <>
      <Layout.Container>
        <Layout.Body>
          <View style={{ paddingBottom: 20 }}>
            <AvatarPicker />
          </View>
          <>
            <AccountBalance activeAccount={activeAccount} />
            <Text.Subheadline>Chain ID:</Text.Subheadline>
            <Text.Body>{chainID}</Text.Body>
            <Text.Subheadline>Remote:</Text.Subheadline>
            <Text.Body>{remote}</Text.Body>
            <Text.Subheadline>Followers:</Text.Subheadline>
            <Text.Body>{followersCount.n_followers}</Text.Body>
            <Text.Subheadline>Following:</Text.Subheadline>
            <Text.Body>{followersCount.n_following}</Text.Body>
            <View></View>
          </>
          <Layout.Footer>
            <Button.TouchableOpacity title="Onboard the current user" onPress={onboard} variant="primary" />
            <Button.TouchableOpacity
              title="Register to the notification service"
              onPress={onPressNotification}
              variant="primary"
            />
            <Button.TouchableOpacity title="Logout" onPress={onPressLogout} style={styles.logout} variant="primary-red" />
            <Button.TouchableOpacity
              title="Remove Account"
              onPress={onRemoveAccount}
              style={styles.logout}
              variant="primary-red"
            />
          </Layout.Footer>
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
