import { Feed } from "@gno/components/feed/feed";
import { useGno } from "@gno/hooks/use-gno";
import { useNavigation } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Markdown from "react-native-marked";

export default function Page() {
  const gno = useGno();
  const [boardContent, setBoardContent] = React.useState<string | undefined>(undefined);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        const response = await gno.render("gno.land/r/berty/social", "jefft0");
        console.log(response);
        setBoardContent(response);
      } catch (error: unknown | Error) {
        console.log(error);
      }
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Feed data={[]} />

        {boardContent ? (
          <Markdown
            value={boardContent}
            flatListProps={{
              initialNumToRender: 8,
            }}
          />
        ) : null}
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
});
