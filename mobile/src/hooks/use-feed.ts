import { Post, User } from "@gno/types";
import { useGnoNativeContext } from "@gnolang/gnonative";
import { useUserCache } from "./use-user-cache";
import useGnoJsonParser from "./use-gno-json-parser";

export const useFeed = () => {
  const gno = useGnoNativeContext();
  const cache = useUserCache();
  const parser = useGnoJsonParser();

  async function fetchThread(address: string, postId: number): Promise<{ data: Post[]; n_posts: number }> {
    await checkActiveAccount();

    const result = await gno.qEval("gno.land/r/berty/social", `GetThreadPosts("${address}",${postId},0, 0, 100)`);
    const json = await enrichData(result);

    return json;
  }

  async function fetchFeed(startIndex: number, endIndex: number): Promise<{ data: Post[]; n_posts: number }> {
    const account = await checkActiveAccount();

    const result = await gno.qEval(
      "gno.land/r/berty/social",
      `GetJsonHomePosts("${account.address}", ${startIndex}, ${endIndex})`
    );

    const json = await enrichData(result);
    return json;
  }

  async function enrichData(result: string | undefined) {
    const jsonPosts = parser.toJson(result);

    const isThread = "n_threads" in jsonPosts;
    const n_posts = isThread ? jsonPosts.n_threads : jsonPosts.n_posts;

    const posts: Post[] = [];

    for (const post of jsonPosts.posts) {
      const creator = await cache.getUser(post.post.creator);

      posts.push({
        user: {
          name: creator.name,
          address: creator.address,
          image: "https://www.gravatar.com/avatar/tmp",
          followers: 0,
          url: "string",
          bio: "string",
        },
        index: post.index,
        id: post.post.id,
        post: post.post.body,
        date: post.post.createdAt,
        n_replies: post.post.n_replies,
        n_replies_all: post.post.n_replies_all,
        parent_id: post.post.parent_id,
      });
    }

    return {
      data: isThread ? posts : posts.reverse(),
      n_posts,
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

  return { fetchFeed, fetchCount, fetchThread };
};
