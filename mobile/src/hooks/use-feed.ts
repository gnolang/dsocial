import { Post, User } from "@gno/types";
import { useGno } from "./use-gno";

export const useFeed = () => {
  const gno = useGno();
  const usersCache = new Map<string, User>();

  async function fetchFeed(startIndex: number, endIndex: number): Promise<{ data: Post[]; n_posts: number }> {
    const currentAccount = await gno.getActiveAccount();
    if (!currentAccount.key) throw new Error("No active account");
    const bech32 = await gno.addressToBech32(currentAccount.key.address);
    const result = await gno.qEval("gno.land/r/berty/social", `GetJsonHomePosts("${bech32}", ${startIndex}, ${endIndex})`);
    const json = await convertToPosts(result, currentAccount.key.name);
    return json;
  }

  async function convertToPosts(result: string | undefined, username: string) {
    if (!result || !(result.startsWith("(") && result.endsWith(" string)"))) throw new Error("Malformed GetThreadPosts response");
    const quoted = result.substring(1, result.length - " string)".length);
    const json = JSON.parse(quoted);
    const jsonPosts = JSON.parse(json);

    if (!jsonPosts.n_posts || jsonPosts.n_posts === 0)
      return {
        data: [],
        n_posts: 0,
      };

    const posts: Post[] = [];

    for (const post of jsonPosts.posts) {
      posts.push({
        user: {
          user: (await getUserByAddress(post.post.creator)).name,
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
    }

    return {
      data: posts,
      n_posts: jsonPosts.n_posts,
    };
  }

  async function getUserByAddress(bech32: string): Promise<User> {
    if (usersCache.has(bech32)) {
      // Cached user
      return usersCache.get(bech32) as User;
    }

    const result = await gno.qEval("gno.land/r/berty/social", `GetJsonUserByAddress("${bech32}")`);
    if (!result || !(result.startsWith("(") && result.endsWith(" string)")))
      throw new Error("Malformed GetJsonUserByAddress response");
    const quoted = result.substring(1, result.length - " string)".length);
    const json = JSON.parse(quoted);
    const jsonPosts = JSON.parse(json);

    const user = {
      name: jsonPosts.name,
      password: "",
      pubKey: "",
      address: json.address,
    };

    usersCache.set(bech32, user);

    return user;
  }

  return { fetchFeed };
};
