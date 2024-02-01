import React from "react";
import { Image, Pressable, View } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { Post } from "../../types";
import Text from "@gno/components/text";

type Group<T extends string> = `(${T})`;

type SharedSegment = Group<"index"> | Group<"search"> | Group<"profile">;

export function Tweet({ item }: { item: Post }) {
  const [segment] = useSegments() as [SharedSegment];
  const router = useRouter();
  return (
    <Pressable>
      {({ hovered, pressed }) => (
        <View
          style={[
            {
              flexDirection: "row",
              padding: 16,
              gap: 16,
              borderBottomColor: "#ccc",
              borderBottomWidth: 1,
              transitionDuration: "200ms",
            },
            hovered && {
              backgroundColor: "#ddd",
            },
            pressed && {
              backgroundColor: "#ccc",
            },
          ]}
        >
          <Image source={{ uri: item.user.image }} style={{ width: 48, height: 48, borderRadius: 24 }} />
          <View style={{ gap: 4, flex: 1, alignItems: "flex-start" }}>
            <Pressable style={{ alignItems: "flex-start" }}>
              {({ hovered }) => (
                <Text.Body style={[{ fontWeight: "bold", fontSize: 16 }, hovered && { textDecorationLine: "underline" }]}>
                  @{item.user.user}
                </Text.Body>
              )}
            </Pressable>

            <Text.Body selectable>{item.post}</Text.Body>
            <View >
              <Text.Caption1 selectable>{item.date}</Text.Caption1>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}
