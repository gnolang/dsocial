type PostInterface = {
  user: User;
  post: string;
  date: string;
  id: string;
  n_replies: number;
  n_replies_all: number;
  parent_id: number;
}
export type ParentPost = PostInterface

export type Post = {
  parent_post?: ParentPost;
} & PostInterface;

export interface User {
  address: string;
  name: string;
  image?: string;
  followers?: number;
  url?: string;
  bio?: string;
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
