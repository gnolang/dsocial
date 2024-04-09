import { Stack } from "expo-router";

export default function DynamicLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: false,
        headerShown: false,
      }}
    />
  );
}
