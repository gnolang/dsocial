export type Post = {
  user: {
    user: string;
    name: string;
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
  name: string;
  password: string;
  pubKey: string | Uint8Array;
  address: string | Uint8Array;
}
