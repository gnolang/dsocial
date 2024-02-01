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
