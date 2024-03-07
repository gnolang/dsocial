import Icons from "@gno/components/icons";
import { colors } from "@gno/styles/colors";
import { Tabs } from "expo-router";

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
          tabBarIcon: ({ focused }) => <Icons.Home color={focused ? colors.icon.focus : colors.icon.default} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ focused }) => <Icons.Search color={focused ? colors.icon.focus : colors.icon.default} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <Icons.Profile color={focused ? colors.icon.focus : colors.icon.default} />,
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
