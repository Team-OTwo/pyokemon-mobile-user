// import { AuthContext } from '@/';
import React, { createContext, useEffect, useMemo, useState } from 'react';
import type { AuthContextType } from '@/types/auth';
import SplashScreen from '@/screens/splash/splash-page';
import {
  setTokens,
  removeTokens,
  getTokens,
} from '@/services/storage/securStorage';
import { logout } from '@/services/apis';
export const AuthContext = createContext<AuthContextType | undefined>({
  userToken: null,
  signIn: async () => {},
  signOut: async () => {},
});

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await getTokens();
      if (token) {
        setUserToken(token.accessToken);
      }
    };
    checkLoginStatus();
  }, []);

  const authActions = useMemo(
    () => ({
      signIn: async (accessToken: string, refreshToken: string) => {
        await setTokens(accessToken, refreshToken);
        setUserToken(accessToken);
      },
      signOut: async () => {
        try {
          await removeTokens();
          setUserToken(null);
          await logout();
        } catch (error) {
          console.error(error);
        }
      },
    }),
    [],
  );

  if (isLoading) {
    return <SplashScreen onFinish={() => setIsLoading(false)} />;
  }

  return (
    <AuthContext.Provider value={{ userToken, ...authActions }}>
      {children}
    </AuthContext.Provider>
  );
}
