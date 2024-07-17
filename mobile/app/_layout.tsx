import { Stack } from "expo-router";

import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Guard } from "@gno/components/auth/guard";
import { GnoNativeProvider } from "@gnolang/gnonative";
import { IndexerProvider } from "@gno/provider/indexer-provider";
import { NotificationProvider } from "@gno/provider/notification-provider";
import { ReduxProvider } from "redux/redux-provider";

const gnoDefaultConfig = {
  remote: process.env.EXPO_PUBLIC_GNO_REMOTE!,
  chain_id: process.env.EXPO_PUBLIC_GNO_CHAIN_ID!,
};

const indexerDefaultConfig = {
  remote: process.env.EXPO_PUBLIC_INDEXER_REMOTE!,
};

const notificationDefaultConfig = {
  remote: process.env.EXPO_PUBLIC_NOTIFICATION_REMOTE!,
};

export default function AppLayout() {
  return (
    <GnoNativeProvider config={gnoDefaultConfig}>
      <NotificationProvider config={notificationDefaultConfig}>
        <IndexerProvider config={indexerDefaultConfig}>
          <ReduxProvider>
            <ThemeProvider value={DefaultTheme}>
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
          </ReduxProvider>
        </IndexerProvider>
      </NotificationProvider>
    </GnoNativeProvider>
  );
}
