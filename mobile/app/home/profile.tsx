import Button from "@gno/components/button";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native";

export default function Messages() {
  const route = useRouter();
  return (
    <SafeAreaView>
      <Button.TouchableOpacity title="Sign out" onPress={() => route.replace("/")} variant="primary-red" />
    </SafeAreaView>
  );
}
