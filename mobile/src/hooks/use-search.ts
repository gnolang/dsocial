import { useGno } from "./use-gno";

const MAX_RESULT = 100;

export const useSearch = () => {
  const gno = useGno();

  async function searchUser(q: string) {
    const currentAccount = await gno.getActiveAccount();
    if (!currentAccount.key) throw new Error("No active account");
    const result = await gno.qEval("gno.land/r/berty/social", `ListJsonUsersByPrefix("${q}", ${MAX_RESULT})`);
    const json = await convertToPosts(result, currentAccount.key.name);
    return json;
  }

  async function convertToPosts(result: string | undefined, username: string) {
    if (!result || !(result.startsWith("(") && result.endsWith(" string)"))) throw new Error("Malformed GetThreadPosts response");
    const quoted = result.substring(1, result.length - " string)".length);
    const json = JSON.parse(quoted);
    const jsonPosts = JSON.parse(json);

    return jsonPosts;
  }

  return {
    searchUser,
  };
};
