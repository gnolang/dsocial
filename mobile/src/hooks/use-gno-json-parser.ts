const useGnoJsonParser = () => {
  const toJson = (data?: string) => {
    if (!data || !(data.startsWith("(") && data.endsWith(" string)"))) throw new Error("Malformed GetThreadPosts response");
    const quoted = data.substring(1, data.length - " string)".length);
    const json = JSON.parse(quoted);
    const jsonPosts = JSON.parse(json);

    return jsonPosts;
  };

  return {
    toJson,
  };
};

export default useGnoJsonParser;
