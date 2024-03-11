import * as React from "react";
import { ColorValue } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const Home = ({ color = "rgb(245, 245, 245)" }: { color?: ColorValue }) => <AntDesign name="home" size={24} color={color} />;

export default Home;
