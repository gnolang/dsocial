import { Post } from "@gno/types";
import { useGno } from "./use-gno";

export const useFeed = () => {
  const gno = useGno();

  async function fetchFeed(startIndex: number, endIndex: number): Promise<{ data: Post[]; n_posts: number }> {
    const currentAccount = await gno.getActiveAccount();
    if (!currentAccount.key) throw new Error("No active account");
    const bech32 = await gno.addressToBech32(currentAccount.key.address);
    const result = await gno.qEval("gno.land/r/berty/social", `GetJsonHomePosts("${bech32}", ${startIndex}, ${endIndex})`);
    const json = convertToPosts(result, currentAccount.key.name);
    return json;
  }

  function convertToPosts(result: string | undefined, username: string) {
    if (!result || !(result.startsWith("(") && result.endsWith(" string)"))) throw new Error("Malformed GetThreadPosts response");
    const quoted = result.substring(1, result.length - " string)".length);
    const json = JSON.parse(quoted);
    const jsonPosts = JSON.parse(json);
    console.log(jsonPosts);

    if (!jsonPosts.n_posts || jsonPosts.n_posts === 0)
      return {
        data: [],
        n_posts: 0,
      };

    const posts: Post[] = [];

    jsonPosts.posts.forEach((post: any) => {
      posts.push({
        user: {
          user: username,
          name: username,
          image: "https://www.gravatar.com/avatar/tmp",
          followers: 0,
          url: "string",
          bio: "string",
        },
        index: post.index,
        id: Math.random().toString(),
        post: post.post.body,
        date: post.post.createdAt,
        n_replies: post.post.n_replies,
        n_replies_all: post.post.n_replies_all,
        parent_id: post.post.parent_id,
      });
    });

    return {
      data: posts.reverse(),
      n_posts: jsonPosts.n_posts,
    };
  }

  return { fetchFeed };
};
