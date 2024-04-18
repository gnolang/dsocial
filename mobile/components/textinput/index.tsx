import styled from "styled-components/native";

export interface Props {
  error?: boolean | string;
}

const TextInput = styled.TextInput.attrs<Props>({
  multiline: false,
})`
  height: 48px;
  margin-top: 4px;
  margin-bottom: 4px;
  border-width: 1px;
  padding: 10px;
  border-radius: 5px;
  width: 100%;
  border-color: ${(props) => (props.error ? "red" : "black")};
`;

export default TextInput;
