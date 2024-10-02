import * as Linking from 'expo-linking';
import { useEffect } from 'react';


const LinkingProvider = ({ children }: { children: React.ReactNode }) => {
  const url = Linking.useURL();

  // const dispatch = useAppDispatch();

  useEffect(() => {
    if (url) {
      const { hostname, path, queryParams } = Linking.parse(url);

      console.log("link url", url);
      console.log("link hostname", hostname);
      console.log("link path", path);
      console.log("link queryParams", queryParams);

      if (queryParams) {

        // if (queryParams.tx && typeof queryParams.tx === "string") {
        //   dispatch(setTxInput({ txInput: queryParams.tx }));
        // }

        // if (queryParams.callback && typeof queryParams.callback === "string") {
        //   dispatch(setCallback({ callback: decodeURIComponent(queryParams.callback) }));
        // }
      }
    }
  }, [url]);

  return <>{children}</>;
};

export { LinkingProvider };