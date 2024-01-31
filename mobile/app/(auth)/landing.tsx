// order matters here
import "react-native-polyfill-globals/auto";

// Polyfill async.Iterator. For some reason, the Babel presets and plugins are not doing the trick.
// Code from here: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-3.html#caveats
(Symbol as any).asyncIterator =
  Symbol.asyncIterator || Symbol.for("Symbol.asyncIterator");

import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Button from "components/button";

export default function Page() {
  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>GnoSocial</Text>
        <Text style={styles.subtitle}>Experimental social dApp on Gno.land</Text>
        <View style={styles.create}>
          <Button.Link title="Sign in" href="/sign-in" />
        </View>
        <View style={styles.signUp}>
          <Button.Link title="Sign Up" href="/sign-up" variant='tertiary' />
        </View>
      </View>
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
  create: {
    marginTop: 24,
  },
  signUp: {
    marginTop: 12,
  },
});
