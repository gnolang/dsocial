import * as React from "react";
import { ColorValue } from "react-native";
import Svg, { G, Path } from "react-native-svg";

export default function Home({ color = "rgb(245, 245, 245)" }: { color?: ColorValue }) {
  return (
    <Svg
      aria-label="Home"
      color={color}
      fill={color}
      height="24"
      role="img"
      viewBox="0 0 24 24"
      width="24"
    >
      <G>
        <Path d="M12 9c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4zm0 6c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm0-13.304L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM19 19.5c0 .276-.224.5-.5.5h-13c-.276 0-.5-.224-.5-.5V8.429l7-4.375 7 4.375V19.5z"></Path>
      </G>
    </Svg>
  );
}
