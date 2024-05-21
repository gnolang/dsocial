import React from "react";
import { TextInput as RNTextInput, TextInputProps } from "react-native";
import styled from "styled-components/native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export interface Props extends TextInputProps {
  error?: boolean | string | undefined;
}

const Container = styled.View<Props>`
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: ${(props) => (props.error ? "red" : "black")};
  border-radius: 4px;
  padding: 2px;
  margin: 10px 0;
`;

const TextInputBase = styled.TextInput.attrs<Props>({
  multiline: false,
})`
  flex: 1;
  padding: 8px;
  font-size: 16px;
  color: black;
  height: 48px;
  border-width: 0;
`;

const ToggleIcon = styled.TouchableOpacity`
  padding: 2px;
`;

export const TextInput = React.forwardRef<RNTextInput, Props>((props, ref) => {
  const [isSecureText, setShowSecureText] = React.useState(props.secureTextEntry);

  return (
    <Container>
      <TextInputBase {...props} ref={ref} secureTextEntry={isSecureText} />

      {props.secureTextEntry ? (
        <ToggleIcon>
          <FontAwesome size={28} name={isSecureText ? "eye-slash" : "eye"} onPress={() => setShowSecureText((prev) => !prev)} />
        </ToggleIcon>
      ) : null}
    </Container>
  );
});

export default TextInput;
