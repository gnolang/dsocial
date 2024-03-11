import { Stack, useRouter } from "expo-router";

export default function Search() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Search",
          headerSearchBarOptions: {
            onChangeText: (event) => {
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
