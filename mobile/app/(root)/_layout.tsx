import Icons from "@gno/components/icons";
import { colors } from "assets/styles/colors";

import { Tabs } from "expo-router";

export default function AppLayout() {
  return (
    <>
      <Tabs>
        <Tabs.Screen
          name="post"
          options={{
            title: "Post",
            href: "/post",
            tabBarIcon: ({ focused }) => <Icons.Home color={focused ? colors.icon.focus : colors.icon.default} />,
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            href: "/home",
            tabBarIcon: ({ focused }) => <Icons.Home color={focused ? colors.icon.focus : colors.icon.default} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            href: "/settings",
            tabBarIcon: ({ focused }) => <Icons.Home color={focused ? colors.icon.focus : colors.icon.default} />,
          }}
        />
      </Tabs>
    </>
  );
}
