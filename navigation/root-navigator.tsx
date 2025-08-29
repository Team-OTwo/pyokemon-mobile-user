import {useAuth} from '../hooks';
import AuthStack from './auth-stack';
import MainStack from './main-stack';

export default function RootNavigator() {
  const {userToken} = useAuth();
  return userToken ? <MainStack /> : <AuthStack />;
}
