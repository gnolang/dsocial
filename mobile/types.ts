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
  id: string;
};
