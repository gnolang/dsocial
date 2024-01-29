import React from "react";
import { View } from "react-native";

interface Props {
  space?: 8 | 16 | 24 | 32 | 40 | 48 | 56 | 64;
}

const Spacer: React.FC<Props> = ({ space = 8 }) => {
  return React.createElement(View, { style: { height: space } });
};

export default Spacer;
