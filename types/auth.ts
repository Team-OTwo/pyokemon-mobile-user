export interface AuthContextType {
  user: string | null;
  signIn: (
    accessToken: string,
    refreshToken: string,
    accountId: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
}
