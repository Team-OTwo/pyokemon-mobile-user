// import { AuthContext } from '@/';
import React, {
  createContext,
  useEffect,
  useMemo,
  useState,
  useContext,
} from 'react';
import type {AuthContextType} from '../types/auth';
import SplashScreen from '../screens/splash/splash-page';
import {
  setTokens,
  removeTokens,
  getTokens,
} from '../services/storage/secureStorage';
import {logout} from '../services/apis';
export const AuthContext = createContext<AuthContextType | undefined>({
  user: null,
  signIn: async () => {},
  signOut: async () => {},
});

export default function AuthProvider({children}: {children: React.ReactNode}) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await getTokens();
      if (token) {
        setUser(token.accessToken);
      }
    };
    checkLoginStatus();
  }, []);

  const authActions = useMemo(
    () => ({
      signIn: async (
        accessToken: string,
        refreshToken: string,
        accountId: string,
      ) => {
        await setTokens(accessToken, refreshToken);
        setUser(accountId);
      },
      signOut: async () => {
        try {
          await logout();
        } catch (error) {
          console.error(error);
        } finally {
          await removeTokens();
          setUser(null);
        }
      },
    }),
    [user],
  );

  if (isLoading) {
    return <SplashScreen onFinish={() => setIsLoading(false)} />;
  }

  return (
    <AuthContext.Provider value={{...authActions, user}}>
      {children}
    </AuthContext.Provider>
  );
}
