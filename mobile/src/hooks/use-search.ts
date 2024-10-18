import { GetJsonFollowersResult, GetJsonFollowingResult, User } from "@gno/types";
import { useGnoNativeContext } from "@gnolang/gnonative";

const MAX_RESULT = 10;

export const useSearch = () => {
  const { gnonative } = useGnoNativeContext();

  async function GetJsonFollowersCount(address: string) {

    const { n_followers } = await GetJsonFollowers(address);
    const { n_following } = await GetJsonFollowing(address);

    return { n_followers, n_following };
  }

  async function GetJsonFollowers(address: string) {

    const result = await gnonative.qEval("gno.land/r/berty/social", `GetJsonFollowers("${address}", 0, 1000)`);
    const json = (await convertToJson(result)) as GetJsonFollowersResult;

    return json;
  }

  async function GetJsonFollowing(address: string) {

    const result = await gnonative.qEval("gno.land/r/berty/social", `GetJsonFollowing("${address}", 0, 1000)`);
    const json = (await convertToJson(result)) as GetJsonFollowingResult;

    return json;
  }

  async function getJsonUserByName(username: string) : Promise<User | undefined> {

    const result = await gnonative.qEval("gno.land/r/berty/social", `GetJsonUserByName("${username}")`);
    const json = (await convertToJson(result));
    if (!json) return undefined;
    // GetJsonUserByName returns an address as bech32 hex.
    // To keep consistency with the rest of the app, we'll convert it to a ui8int string.
    json.bech32 = json.address as string;
    json.address = await gnonative.addressFromBech32(json.address as string);

    return json as User;
  }

  async function searchUser(q: string, accountToExclude?: User) {

    const result = await gnonative.qEval("gno.land/r/berty/social", `ListJsonUsersByPrefix("${q}", ${MAX_RESULT})`);
    const usernames = await convertToJson(result);
    if (accountToExclude) {
      // Remove the active account's own username.
      const i = usernames.indexOf(accountToExclude.name, 0);
      if (i >= 0) {
        usernames.splice(i, 1);
      }
    }

    return usernames;
  }

  async function convertToJson(result: string | undefined) {
    if (result === '("" string)') return undefined;

    if (!result || !(result.startsWith("(") && result.endsWith(" string)"))) throw new Error("Malformed GetThreadPosts response");
    const quoted = result.substring(1, result.length - " string)".length);
    const json = JSON.parse(quoted);
    const jsonPosts = JSON.parse(json);

    return jsonPosts;
  }

  return {
    searchUser,
    getJsonUserByName,
    GetJsonFollowersCount,
    GetJsonFollowing,
    GetJsonFollowers,
  };
};

export type UseSearchReturnType = ReturnType<typeof useSearch>;
