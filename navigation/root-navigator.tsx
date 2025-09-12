import {useAuth} from '../hooks';
import AuthStack from './auth-stack';
import MainStack from './main-stack';

export default function RootNavigator() {
  const {user} = useAuth();
  return user ? <MainStack /> : <AuthStack />;
}
