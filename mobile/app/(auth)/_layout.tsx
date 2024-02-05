import 'react-native-polyfill-globals/auto';

// Polyfill async.Iterator. For some reason, the Babel presets and plugins are not doing the trick.
// Code from here: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-3.html#caveats
(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.for('Symbol.asyncIterator');

import React from "react";
import { Stack } from "expo-router";

export default function DynamicLayout() {
  return (
    <Stack
      screenOptions={{
        title: "GnoSocial",
        headerLargeTitle: false,
      }}
    />
  );
}
