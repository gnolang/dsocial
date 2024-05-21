import { colors } from "@gno/styles/colors";
import { ActivityIndicator, TouchableOpacityProps } from "react-native";
import styled, { css } from "styled-components/native";

const variants = {
  common: css`
    font-size: 16px;
    font-weight: bold;
    width: 100%;
    height: 48px;
    justify-content: center;
    border-radius: 28px;
    margin-top: 4px;
    margin-bottom: 4px;
  `,
  primary: css`
    background: ${colors.primary};
  `,
  secondary: css`
    background: ${colors.button.secondary};
  `,
  text: css`
    background: transparent;
  `,
  "primary-red": css`
    background-color: red;
  `,
};

const textVariants = {
  common: css`
    color: white;
    font-weight: bold;
    text-align: center;
  `,
  primary: css`
    color: white;
  `,
  text: css`
    color: ${colors.text.secondary};
    text-align: left;
    font-size: 14px;
  `,
  secondary: css`
    color: white;
  `,
  "primary-red": css`
    color: white;
  `,
};

export type ButtonVariant = keyof typeof variants;

export const ButtonBase = styled.TouchableOpacity<{ variant: ButtonVariant }>`
  padding: 10px;
  border-radius: 5px;
  ${variants.common}
  ${(props) => variants[props.variant || "primary"]}
`;

export type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant: ButtonVariant;
} & TouchableOpacityProps;

const Button: React.FC<Props> = ({ variant, title, loading, ...rest }) => {
  return (
    <ButtonBase variant={variant} {...rest}>
      {rest.children}
      {loading ? <ActivityIndicator size="small" /> : <ButtonLabel variant={variant}>{title}</ButtonLabel>}
    </ButtonBase>
  );
};

export const ButtonLabel = styled.Text<{ variant: Partial<ButtonVariant> }>`
  ${textVariants.common}
  ${(props) => textVariants[props.variant || "primary"]}
`;

export default Button;
