// order matters here
import "react-native-polyfill-globals/auto";

// Polyfill async.Iterator. For some reason, the Babel presets and plugins are not doing the trick.
// Code from here: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-3.html#caveats
(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.for("Symbol.asyncIterator");

import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { store } from "@gno/redux";
import { Guard } from "@gno/components/auth/guard";

export default function AppLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Guard>
          <Stack
            screenOptions={{
              headerShown: false,
              headerLargeTitle: true,
              headerBackVisible: false,
            }}
          />
        </Guard>
      </ThemeProvider>
    </Provider>
  );
}
