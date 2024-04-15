import { Stack } from "expo-router";

export default function DynamicLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: false,
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />

      <Stack.Screen
        name="following"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="followers"
        options={{
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
