import * as React from "react";
import { ColorValue } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Search({ color = "rgb(245, 245, 245)" }: { color?: ColorValue }) {
  return <Ionicons name="search" size={28} color={color} />;
}
