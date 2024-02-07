import { useRouter, useSegments } from "expo-router";
import React from "react";
import { User } from "@gno/types";
import { useAppSelector } from "redux/store";
import { selectAccount } from "redux/features/accountSlice";

interface PropsWithChildren {
  children: React.ReactNode;
}

// This hook will protect the route access based on user authentication.
function useProtectedRoute(user: User | undefined) {
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (
      // If the user is not signed in and the initial segment is not anything in the auth group.
      !user &&
      !inAuthGroup
    ) {
      // Redirect to the sign-in page.
      router.replace("/landing");
    } else if (user && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace("/home");
    }
  }, [user, segments]);
}

export function Guard(props: PropsWithChildren) {
  const account = useAppSelector(selectAccount);

  useProtectedRoute(account);

  return props.children;
}
