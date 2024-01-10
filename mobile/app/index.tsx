import { Button, StyleSheet, Text, View, Pressable } from "react-native";
import { Link } from 'expo-router';

// order matters here
import "react-native-polyfill-globals/auto";

// Polyfill async.Iterator. For some reason, the Babel presets and plugins are not doing the trick.
// Code from here: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-3.html#caveats
(Symbol as any).asyncIterator =
  Symbol.asyncIterator || Symbol.for("Symbol.asyncIterator");

import { useGno } from "@gno/hooks/use-gno";
import React from "react";

export default function Page() {

  const gno = useGno();

  React.useEffect(() => {
    gno
      .render("gno.land/r/demo/boards", "gnonative/1")
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  }, []);


  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Hello World</Text>
        <Text style={styles.subtitle}>This is the first page of your app.</Text>
      </View>


      <Link href="/signup" asChild>
      <Pressable>
        <Text>Create account</Text>
      </Pressable>
      </Link>

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
