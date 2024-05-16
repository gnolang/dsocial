import { Post, User } from "@gno/types";
import { useGnoNativeContext } from "@gnolang/gnonative";
import { useUserCache } from "./use-user-cache";
import useGnoJsonParser from "./use-gno-json-parser";
import { useIndexerContext } from "@gno/provider/indexer-provider";

export const useFeed = () => {
  const gno = useGnoNativeContext();
  const cache = useUserCache();
  const parser = useGnoJsonParser();
  const indexer = useIndexerContext();

  async function fetchThread(address: string, postId: number): Promise<{ data: Post[]; n_posts: number }> {
    await checkActiveAccount();

    const result = await gno.qEval("gno.land/r/berty/social", `GetThreadPosts("${address}",${postId},0, 0, 100)`);
    const json = await enrichData(result);

    return json;
  }

  async function fetchFeed(startIndex: number, endIndex: number): Promise<{ data: Post[]; n_posts: number }> {
    const account = await checkActiveAccount();

    const [nHomePosts, addrAndIDs] = await indexer.getHomePosts(account.address, BigInt(startIndex), BigInt(endIndex));
    const result = await gno.qEval("gno.land/r/berty/social", `GetJsonTopPostsByID(${addrAndIDs})`);
    return await enrichData(result, nHomePosts);
  }

  async function enrichData(result: string, nHomePosts?: number) {
    const jsonResult = parser.toJson(result);

    // If isThread then jsonResult is {n_threads: number, posts: array<{index: number, post: Post}>} from GetThreadPosts.
    const isThread = "n_threads" in jsonResult;
    const jsonPosts = isThread ? jsonResult.posts : jsonResult;
    const n_posts = isThread ? jsonResult.n_threads : nHomePosts;

    const posts: Post[] = [];

    for (const jsonPost of jsonPosts) {
      const post = isThread ? jsonPost.post : jsonPost;
      const creator = await cache.getUser(post.creator);

      posts.push({
        user: {
          name: creator.name,
          address: creator.address,
          image: "https://www.gravatar.com/avatar/tmp",
          followers: 0,
          url: "string",
          bio: "string",
        },
        id: post.id,
        post: post.body,
        date: post.createdAt,
        n_replies: post.n_replies,
        n_replies_all: post.n_replies_all,
        parent_id: post.parent_id,
      });
    }

    return {
      data: isThread ? posts : posts.reverse(),
      n_posts,
    };
  }

  async function fetchCount() {
    const account = await checkActiveAccount();

    // Use a range of 0,0 to just get nHomePosts.
    const [nHomePosts, _] = await indexer.getHomePosts(account.address, BigInt(0), BigInt(0));
    return nHomePosts;
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
