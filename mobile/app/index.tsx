import { Link, useRouter, useNavigation } from "expo-router";
import { Button, SafeAreaView, Text, View } from "react-native";

export default function Root() {
  const route = useRouter();
  const navigation = useNavigation();

  return (
    <SafeAreaView>
      {/* <Text>Root screen {navigation.getState().routes} </Text> */}
      <Link href="/home/search">
        <Text>Navigate to nested route</Text>
      </Link>
      <View style={{ padding: 20 }} />
      <Button title="Navigate to nested route" onPress={() => route.push("/home/search")} />
    </SafeAreaView>
  );
}
