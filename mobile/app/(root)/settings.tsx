import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { useGno } from "@gno/hooks/use-gno";
import { logedOut, useAppDispatch } from "@gno/redux";

export default function Page() {
  const [activeAccount, setActiveAccount] = useState<string | undefined>(undefined);

  const gno = useGno();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        const account = await gno.getActiveAccount();
        setActiveAccount(JSON.stringify(account));

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

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 20 }}>Active Account:</Text>
          <Text style={{ fontSize: 14 }}>{activeAccount}</Text>
        </View>
        <Text onPress={() => dispatch(logedOut())} style={styles.logout}>
          Logout
        </Text>
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
  logout: {
    color: "#007AFF",
    marginTop: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
});
