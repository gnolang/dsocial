import { Link } from "expo-router";
import { ActivityIndicator, GestureResponderEvent } from "react-native";
import { ButtonVariant, TouchableOpacityButton, styles } from "./button";
import Text from "../text";

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
      <TouchableOpacityButton variant={variant} onPress={onPress}>
        {loading ? <ActivityIndicator size="small" /> : <Text.Body style={styles.buttonText}>{title}</Text.Body>}
      </TouchableOpacityButton>
    </Link>
  );
};

export default LinkButton;
