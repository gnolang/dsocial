import { colors } from "assets/styles/colors";
import Spacer from "components/spacer";
import { Text, View } from "react-native";
import styled from "styled-components/native";
// import Exclamation from '../icons/Exclamation';

export interface Props {
  message?: string;
  severity: "error" | "warning" | "info" | "success";
}

const Wrapper = styled.View`
  justify-content: center;
  align-items: center;
`;

const InnerContent = styled.View<{ severity: Props["severity"] }>`
  flex-direction: row;
  align-items: center;
  border-radius: 16px;
  padding-left: 12px;
  padding-right: 12px;
  background-color: ${({ severity }) => {
    switch (severity) {
      case "error":
        return colors.danger;
      case "warning":
        return colors.warning;
      case "info":
        return colors.main;
      case "success":
        return colors.success;
    }
  }};
`;

const ErrorText = styled.Text<{ paddingLeft: boolean }>`
  padding: 10px;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0;
  padding-left: ${(props) => (props.paddingLeft ? "5.5px" : "4.5px")};
  text-align: center;
`;

const Alert = ({ message, severity }: Props) => {
  const isError = severity === "error";

  return (
    <Wrapper>
      {message ? (
        <InnerContent severity={severity}>
          {/* {isError && <Exclamation />} */}
          <ErrorText paddingLeft={Boolean(isError)}>{message}</ErrorText>
        </InnerContent>
      ) : (
        <Spacer space={40} />
      )}
    </Wrapper>
  );
};

export default Alert;
