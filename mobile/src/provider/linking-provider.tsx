import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { useAppDispatch, setLinkingParsedURL } from "@gno/redux";


const LinkingProvider = ({ children }: { children: React.ReactNode }) => {
  const url = Linking.useURL();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (url) {
      const linkingParsedURL = Linking.parse(url);
      const { hostname, path, queryParams } = linkingParsedURL;

      console.log("link url", url);
      console.log("link hostname", hostname);
      console.log("link path", path);
      console.log("link queryParams", queryParams);

      dispatch(setLinkingParsedURL(linkingParsedURL))
    }
  }, [url]);

  return <>{children}</>;
};

export { LinkingProvider };