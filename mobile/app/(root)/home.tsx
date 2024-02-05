import { useNavigation } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Feed } from "@gno/components/feed/feed";
import { useGno } from "@gno/hooks/use-gno";
import { Post } from "../../types";

export default function Page() {
  const gno = useGno();
  const [boardContent, setBoardContent] = React.useState<string | undefined>(undefined);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        const response = await gno.render("gno.land/r/berty/social", "jefft0");
        setBoardContent(response);
      } catch (error: unknown | Error) {
        console.log(error);
      }
    });
    return unsubscribe;
  }, [navigation]);

  /**
   * Given the following content as an example:
   *  \- [@jefft0](/r/demo/users:jefft0), [2024-01-30 2:21pm UTC](/r/berty/social:jefft0/1) (0 replies)
   *
   * The following regex will match and capture the following:
   *  \[@([^\]]+)\]: Matches [@jefft0] and captures jefft0 in a group.
   *  \(([^)]+)\): Matches (/r/berty/social:jefft0/1) and captures /r/berty/social:jefft0/1 in a group.
   *  \[(\d{4}-\d{2}-\d{2} \d{1,2}:\d{2}[ap]m UTC)\]: Matches [2024-01-30 2:21pm UTC] and captures 2024-01-30 2:21pm UTC in a group.
   *  \(([^)]+)\): Matches the (0 replies) part and captures 0 replies in a group.
   */
  const pattern = /\[@([^)]+)]\(([^)]+)\), \[([^)]+)\]\(([^)]+)\) \((\d+) replies\) \((\d+) reposts\)/g;

  const convertToPost = (content: string | undefined) => {
    const data = content?.split("----------------------------------------");

    const posts: Post[] = [];

    data?.forEach((element) => {
      const post = element.split("\n");

      const match = post[2].split(pattern);

      if (match) {
        console.log("match found.", match);
        const username = match[1];
        const userLink = match[2];
        const date = match[3];
        const postLink = match[4];
        const replies = match[5];

        posts.push({
          user: {
            user: username,
            name: username,
            image: "https://www.gravatar.com/avatar/tmp",
            followers: 0,
            url: "string",
            bio: "string",
          },
          post: post[1],
          id: Math.random().toString(),
          date,
        });
      } else {
        console.log("No match found.");
      }
    });

    return posts.reverse();
  };

  return <Feed contentInsetAdjustmentBehavior="automatic" data={convertToPost(boardContent)} />;
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
