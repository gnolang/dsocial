import { Link } from "expo-router";
import { PressableProps } from "react-native";
import Button, { ButtonVariant } from "./button";

interface ButtonProps extends PressableProps {
  title: string;
  href: string;
  variant?: ButtonVariant;
}

const LinkButton = (props: ButtonProps) => {
  const { href, title, variant = "primary" } = props;

  return (
    <Link href={href} asChild>
      <Button title={title} variant={variant} onPress={() => {}} />
    </Link>
  );
};

export default LinkButton;
