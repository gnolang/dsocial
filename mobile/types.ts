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
  id: string;
};

export interface User {
  name: string;
  password: string;
  pubKey: string | Uint8Array;
  address: string | Uint8Array;
}
