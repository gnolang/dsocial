import React from "react";
import { FlatList, Platform } from "react-native";
import { Tweet } from "./tweet";
import { useRef } from "react";
import { Post } from "../../types";
import useScrollToTop from "../utils/useScrollToTopWithOffset";

export function Feed({ data, ...props }: { data: Post[] } & Partial<FlatList["props"]>) {
  const ref = useRef<FlatList>(null);
  useScrollToTop(
    ref,
    Platform.select({
      ios: -150,
      default: 0,
    })
  );
  return (
    <FlatList
      ref={ref}
      scrollToOverflowEnabled
      style={{ flex: 1 }}
      {...props}
      data={data}
      keyExtractor={(item) => `${item.id}`}
      renderItem={({ item }) => <Tweet item={item} />}
    />
  );
}
