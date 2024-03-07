import { ColorValue } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const Search = ({ color = "rgb(245, 245, 245)" }: { color?: ColorValue }) => <AntDesign name="search1" size={24} color={color} />;

export default Search;
