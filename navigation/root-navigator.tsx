import useAuth from '@/hooks/useAuth';
import AuthStack from './auth-stack.tsx';
import MainStack from './main-stack.tsx';

export default function RootNavigator() {
  const { userToken } = useAuth();
  return userToken ? <MainStack /> : <AuthStack />;
}
