import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";

export default function Page() {
  const [phrase, setPhrase] = React.useState<string | undefined>(undefined);
  // const gno = useGno();

  const onReviewPressHandler = async () => {
    try {
      // setPhrase(await gno.generateRecoveryPhrase());
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Create your account</Text>
      </View>

      <Text>{phrase}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
});
