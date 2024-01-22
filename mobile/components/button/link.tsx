import { Link } from "expo-router";
import { Pressable, PressableProps, StyleSheet, Text } from "react-native";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "link" | "white" | "primary2";

interface ButtonProps extends PressableProps {
  label: string;
  href: string;
}

const LinkButton = (props: ButtonProps) => {
  const { style, href, label, ...rest } = props;

  return (
    <Link href={href} asChild>
      <Pressable style={styles.button} {...rest}>
        <Text style={styles.text}>{label}</Text>
      </Pressable>
    </Link>
  );
};

export default LinkButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#006eff",
    width: "100%",
    height: 48,
    borderRadius: 28,
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
