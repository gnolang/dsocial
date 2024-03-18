import { useRouter, useSegments } from "expo-router";
import React from "react";
import { User } from "@gno/types";
import { useAppSelector } from "redux/store";
import { selectAccount } from "redux/features/accountSlice";
import { SharedSegment } from "app/home/_layout";

interface PropsWithChildren {
  children: React.ReactNode;
}

// This hook will protect the route access based on user authentication.
function useProtectedRoute(user: User | undefined) {
  const segments = useSegments();
  const router = useRouter();
  const [segment] = useSegments() as [SharedSegment];

  React.useEffect(() => {
    const inAuthGroup = segments.length == 0 || segments[0] === "sign-up" || segments[0] == "sign-in";

    // If the user is not signed in and the initial segment is not anything in the auth group.
    if (!user && !inAuthGroup) {
      router.push("/");
    }
  }, [user, segments]);
}

export function Guard(props: PropsWithChildren) {
  const account = useAppSelector(selectAccount);

  useProtectedRoute(account);

  return props.children;
}
