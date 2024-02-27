import { useEffect, useState } from "react";
import { View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSearch } from "@gno/hooks/use-search";
import SearchResults from "@gno/components/list/search/search-result-list";

export default function Search() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const search = useSearch();
  const [data, setData] = useState<string[]>([]);

  useEffect(() => {
    if (params.q) {
      search.searchUser(params.q).then((result) => {
        setData(result);
      });
    } else {
      setData([]);
    }
  }, [params.q]);

  const onPress = (item: string) => {
    // TODO: navigate to profile
    // router.push("profile", { user: item });
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Stack.Screen
        options={{
          title: "Search",
          headerSearchBarOptions: {
            autoCapitalize: "none",
            inputType: "text",
            onChangeText: (event) => {
              router.setParams({
                q: event.nativeEvent.text,
              });
            },
          },
        }}
      />
      <SearchResults data={data} onPress={onPress} />
    </View>
  );
}
