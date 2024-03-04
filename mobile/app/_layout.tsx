import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerLargeTitle: true,
        headerBackVisible: false,
      }}
    />
  );
}
