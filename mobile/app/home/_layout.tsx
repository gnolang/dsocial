import { Stack, Tabs } from "expo-router";

type Group<T extends string> = `(${T})`;
export type SharedSegment = Group<"feed"> | Group<"search"> | Group<"profile">;

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
      <Tabs.Screen
        name="post"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
