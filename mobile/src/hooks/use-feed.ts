import { ParentPost, Post, User } from "@gno/types";
import { useGnoNativeContext } from "@gnolang/gnonative";
import { useUserCache } from "./use-user-cache";
import useGnoJsonParser from "./use-gno-json-parser";
import { useIndexerContext } from "@gno/provider/indexer-provider";
import { Alert } from "react-native";

interface ThreadPosts {
  data: Post[];
  n_posts: number;
}

export const useFeed = () => {
  const gno = useGnoNativeContext();
  const cache = useUserCache();
  const parser = useGnoJsonParser();
  const indexer = useIndexerContext();

  async function fetchThreadPosts(address: string, startIndex: number, endIndex: number): Promise<ThreadPosts> {
    await checkActiveAccount();

    const result = await gno.qEval("gno.land/r/berty/social", `GetThreadPosts("${address}",0, 0, ${startIndex}, ${endIndex})`);
    const json = await enrichData(result);

    return json;
  }

  async function fetchThread(address: string, postId: number): Promise<ThreadPosts> {
    await checkActiveAccount();

    const result = await gno.qEval("gno.land/r/berty/social", `GetThreadPosts("${address}",${postId},0, 0, 100)`);
    const json = await enrichData(result);

    return json;
  }

  async function fetchFeed(address: string, startIndex: number, endIndex: number): Promise<ThreadPosts> {
    try {
      const [nHomePosts, addrAndIDs] = await indexer.getHomePosts(address, BigInt(startIndex), BigInt(endIndex));
      const result = await gno.qEval("gno.land/r/berty/social", `GetJsonTopPostsByID(${addrAndIDs})`);
      return await enrichData(result, nHomePosts);
    } catch (error) {
      Alert.alert("Error while fetching posts", " " + error);
      throw error;
    }
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

      let parentPost: Post | undefined;

      if (post.repost_user && post.parent_id) {
        const parent_user = await cache.getUser(post.repost_user as string);
        const parent_post = await fetchParentPost(post.parent_id, post.repost_user as string);
        parentPost = convertToPost(parent_post, parent_user);
      }

      posts.push(convertToPost(post, creator, parentPost));
    }

    return {
      data: posts.reverse(),
      n_posts,
    };
  }

  function convertToPost(jsonPost: any, creator: User, parentPost?: ParentPost): Post {
    const post: Post = {
      user: {
        name: creator.name,
        address: creator.address,
        image: "https://www.gravatar.com/avatar/tmp",
        followers: 0,
        url: "string",
        bio: "string",
      },
      id: jsonPost.id,
      post: jsonPost.body,
      date: jsonPost.createdAt,
      n_replies: jsonPost.n_replies,
      n_replies_all: jsonPost.n_replies_all,
      parent_id: jsonPost.parent_id,
      parent_post: parentPost,
    }

    return post;
  }

  async function fetchParentPost(postId: number, address: string) {
    const payload = `[]UserAndPostID{{\"${address}\", ${postId}},}`
    const result = await gno.qEval("gno.land/r/berty/social", `GetJsonTopPostsByID(${payload})`);
    const jsonResult = parser.toJson(result);
    return jsonResult[0];
  }

  async function fetchCount(address: string) {
    // Use a range of 0,0 to just get nHomePosts.
    const [nHomePosts, _] = await indexer.getHomePosts(address, BigInt(0), BigInt(0));
    return nHomePosts;
  }

  async function checkActiveAccount() {
    const currentAccount = await gno.getActiveAccount();
    if (!currentAccount.key) throw new Error("No active account");

    const bech32 = await gno.addressToBech32(currentAccount.key.address);

    const user: User = { address: bech32, name: currentAccount.key.name };

    return user;
  }

  return { fetchFeed, fetchCount, fetchThread, fetchThreadPosts, checkActiveAccount };
};
