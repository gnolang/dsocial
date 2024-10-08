import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { useAppDispatch, setLinkingParsedURL } from "@gno/redux";


const LinkingProvider = ({ children }: { children: React.ReactNode }) => {
  const url = Linking.useURL();

  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      if (url) {
        const linkingParsedURL = Linking.parse(url);
        const { hostname, path, queryParams } = linkingParsedURL;

        console.log("link url", url);
        console.log("link hostname", hostname);
        console.log("link path", path);
        console.log("link queryParams", queryParams);

        await dispatch(setLinkingParsedURL(linkingParsedURL)).unwrap();
      }
    })();
  }, [url]);

  return <>{children}</>;
};

export { LinkingProvider };