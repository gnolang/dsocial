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
  index: string;
  id: string;
  n_replies: number;
  n_replies_all: number;
  parent_id: string;
};

export interface User {
  address: string;
  name: string;
}

export interface Following {
  name: string;
  address: string;
  started_following_at: string;
}
