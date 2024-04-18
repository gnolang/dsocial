import { User } from "@gno/types";
import { useGno } from "./use-gno";

const usersCache = new Map<string, User>();

export const useUserCache = () => {
  const gno = useGno();

  async function getUser(bech32: string): Promise<User> {
    if (usersCache.has(bech32)) {
      // Cached user
      return usersCache.get(bech32) as User;
    }

    const result = await gno.qEval("gno.land/r/berty/social", `GetJsonUserByAddress("${bech32}")`);
    if (!result || !(result.startsWith("(") && result.endsWith(" string)")))
      throw new Error("Malformed GetJsonUserByAddress response");
    const quoted = result.substring(1, result.length - " string)".length);
    const jsonString = JSON.parse(quoted);
    const userJson = JSON.parse(jsonString);

    const user = {
      name: userJson.name,
      password: "",
      pubKey: "",
      address: userJson.address,
    };

    usersCache.set(bech32, user);

    return user;
  }
  return { getUser };
};
