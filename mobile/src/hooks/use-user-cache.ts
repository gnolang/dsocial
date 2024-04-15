import { User } from "@gno/types";
import { useGno } from "./use-gno";

const usersCache = new Map<string, User>();

export const useUserCache = () => {
  const gno = useGno();

  async function getUser(bech32: string): Promise<User> {
    if (usersCache.has(bech32)) {
      // Cached user
      console.log("cached user!!!");
      return usersCache.get(bech32) as User;
    }

    const result = await gno.qEval("gno.land/r/berty/social", `GetJsonUserByAddress("${bech32}")`);
    if (!result || !(result.startsWith("(") && result.endsWith(" string)")))
      throw new Error("Malformed GetJsonUserByAddress response");
    const quoted = result.substring(1, result.length - " string)".length);
    const json = JSON.parse(quoted);
    const jsonPosts = JSON.parse(json);

    const user = {
      name: jsonPosts.name,
      password: "",
      pubKey: "",
      address: json.address,
    };

    usersCache.set(bech32, user);

    return user;
  }
  return { getUser };
};
