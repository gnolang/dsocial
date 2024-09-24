import { KeyInfo } from "@gnolang/gnonative";

type PostInterface = {
  user: User;
  post: string;
  date: string;
  id: string;
  n_replies: number;
  n_gnods: number;
  n_replies_all: number;
  parent_id: number;
}
export type ParentPost = PostInterface

export type Post = {
  repost_parent?: ParentPost;
} & PostInterface;

export interface User extends Pick<KeyInfo, "address" | "name"> {
  bech32: string;
  avatar?: string;
}

export interface Following {
  address: string;
  started_following_at: string;
  user?: User;
}

export interface GetJsonFollowersResult {
  followers: Following[];
  n_followers: number;
}
export interface GetJsonFollowingResult {
  following: Following[];
  n_following: number;
}
