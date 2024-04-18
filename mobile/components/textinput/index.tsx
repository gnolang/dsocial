import React from "react";
import { TextInput as RNTextInput, View, TextInputProps, StyleSheet } from "react-native";
import styled from "styled-components/native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export interface Props {
  error?: boolean | string;
}

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>((props, ref) => {
  const [isSecureText, setShowSecureText] = React.useState(props.secureTextEntry);

  return (
    <View style={styles.container}>
      <TextInputStyled {...props} ref={ref} secureTextEntry={isSecureText} />

      {props.secureTextEntry ? (
        <FontAwesome
          size={32}
          name={isSecureText ? "eye-slash" : "eye"}
          style={styles.icon}
          onPress={() => setShowSecureText((prev) => !prev)}
        />
      ) : null}
    </View>
  );
});

const TextInputStyled = styled.TextInput.attrs<Props>({
  multiline: false,
})`
  height: 48px;
  margin-top: 4px;
  margin-bottom: 4px;
  padding: 10px;
  width: 90%;
  margin-bottom: 4px;

  flex: 1;
  margin-top: 4px;

  border-color: ${(props) => (props.error ? "red" : "black")};
  border-radius: 5px;
  border-bottom-width: 1px;
  border-top-width: 1px;
  border-left-width: 1px;
`;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    height: 48,
    // height: 48,
    // width: 48,
    borderColor: "black",
    borderRadius: 5,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderRightWidth: 1,
  },
});

export default TextInput;
