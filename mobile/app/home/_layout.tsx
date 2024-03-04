import { Stack, Tabs } from "expo-router";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          // tabBarIcon: makeIcon("home", "home-active"),
        }}
      />
    </Tabs>
  );
}
