import { Link } from "expo-router";
import { ActivityIndicator, GestureResponderEvent } from "react-native";
import { ButtonVariant, ButtonBase, ButtonLabel } from "./button";

interface ButtonProps {
  title: string;
  href: string;
  variant?: ButtonVariant;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
  loading?: boolean;
}

const LinkButton = (props: ButtonProps) => {
  const { href, title, variant = "primary", onPress, loading } = props;

  return (
    <Link href={href} asChild>
      <ButtonBase variant={variant} onPress={onPress}>
        {loading ? <ActivityIndicator size="small" /> : <ButtonLabel variant={variant}>{title}</ButtonLabel>}
      </ButtonBase>
    </Link>
  );
};

export default LinkButton;
