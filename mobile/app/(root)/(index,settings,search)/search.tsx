import { Stack, useLocalSearchParams, useRouter } from "expo-router";

export default function Search() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  return (
    <>
      <Stack.Screen
        options={{
          title: "Search",
          headerSearchBarOptions: {
            onChangeText: (event) => {
              // Update the query params to match the search query.
              router.setParams({
                q: event.nativeEvent.text,
              });
            },
          },
        }}
      />
    </>
  );
}
