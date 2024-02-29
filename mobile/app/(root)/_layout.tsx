import Icons from "@gno/components/icons";
import { colors } from "assets/styles/colors";
import { Tabs } from "expo-router";

type Group<T extends string> = `(${T})`;

export type SharedSegment = Group<"index"> | Group<"search"> | Group<"profile"> | Group<"post">;

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "rgb(29, 155, 240)",
      }}
    >
      <Tabs.Screen
        name="(index)"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <Icons.Home color={focused ? colors.icon.focus : colors.icon.default} />,
        }}
      />
      <Tabs.Screen
        name="(search)"
        options={{
          title: "Search",
          tabBarIcon: ({ focused }) => <Icons.Home color={focused ? colors.icon.focus : colors.icon.default} />,
        }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => <Icons.Home color={focused ? colors.icon.focus : colors.icon.default} />,
        }}
      />
    </Tabs>
  );
}
