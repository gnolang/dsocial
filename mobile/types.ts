export type Post = {
  user: {
    name: string;
    address: string;
    image: string;
    followers: number;
    url: string;
    bio: string;
  };
  post: string;
  date: string;
  id: string;
  n_replies: number;
  n_replies_all: number;
  parent_id: number;
};

export interface User {
  address: string;
  name: string;
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
