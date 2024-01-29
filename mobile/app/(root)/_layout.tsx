import { Tabs } from "expo-router";

export default function AppLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="post"
        options={{
          title: "Post",
          href: "/post",
        }}
      />
      <Tabs.Screen
        name="following"
        options={{
          title: "Following",
          href: "/following",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          href: "/settings",
        }}
      />
    </Tabs>
  );
}
