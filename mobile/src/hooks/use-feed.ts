import { Post, User } from "@gno/types";
import { useGno } from "./use-gno";
import { useUserCache } from "./use-user-cache";

export const useFeed = () => {
  const gno = useGno();
  const cache = useUserCache();

  async function fetchFeed(startIndex: number, endIndex: number): Promise<{ data: Post[]; n_posts: number }> {
    const account = await checkActiveAccount();

    const result = await gno.qEval(
      "gno.land/r/berty/social",
      `GetJsonHomePosts("${account.address}", ${startIndex}, ${endIndex})`
    );

    const json = await convertToPosts(result, account.name);
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
          user: (await cache.getUser(post.post.creator)).name,
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
      data: posts.reverse(),
      n_posts: jsonPosts.n_posts,
    };
  }

  async function fetchCount() {
    const account = await checkActiveAccount();

    const result = await gno.qEval("gno.land/r/berty/social", `GetHomePostsCount("${account.address}")`);

    const data = result.substring(1, result.length - " int)".length);

    return parseInt(data);
  }

  async function checkActiveAccount() {
    const currentAccount = await gno.getActiveAccount();
    if (!currentAccount.key) throw new Error("No active account");

    const bech32 = await gno.addressToBech32(currentAccount.key.address);

    const user: User = { address: bech32, name: currentAccount.key.name };

    return user;
  }

  return { fetchFeed, fetchCount };
};
