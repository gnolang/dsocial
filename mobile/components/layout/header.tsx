import React from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import Icons from "../icons";
import { useNavigation } from "@react-navigation/native";

type Props = {
  iconType?: "close" | "back";
  onCloseHandler?: () => void;
  title?: string;
  subtitle?: string;
  style?: any;
};

const Header: React.FC<Props> = ({ iconType = "close", onCloseHandler, title = "", subtitle = "", style }) => {
  const navigate = useNavigation();

  if (!onCloseHandler) {
    onCloseHandler = () => {
      navigate.goBack();
    };
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onCloseHandler}>
        {iconType === "close" ? <Icons.Close /> : <Icons.ArrowLeft />}
      </TouchableOpacity>
      <View style={styles.contentArea}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    paddingLeft: 16,
  },
  contentArea: { flex: 1, alignItems: "center", paddingRight: 36 },
	title: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#000000",
	},
	subtitle: {
		fontSize: 12,
		color: "#000000",
	},
});

export default Header;
