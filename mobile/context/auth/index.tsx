import { useRouter, useSegments } from "expo-router";
import React from "react";
import { User } from "@gno/types";
import { useAppSelector } from "redux/store";
import { selectAccount } from "redux/features/accountSlice";

interface AuthContext {
  // signIn: (user: User) => void;
  // signOut: () => void;
  // user: User | null;
}

interface PropsWithChildren {
  children: React.ReactNode;
}

const AuthContext = React.createContext<AuthContext | null>(null);

// This hook can be used to access the user info.
export function useAuth(): AuthContext {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
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

export function Provider(props: PropsWithChildren) {
  const account = useAppSelector(selectAccount);

  useProtectedRoute(account);

  return (
    <AuthContext.Provider
      value={
        {
          // signIn: (user) => setAuth(user),
          // signOut: () => setAuth(null),
        }
      }
    >
      {props.children}
    </AuthContext.Provider>
  );
}
