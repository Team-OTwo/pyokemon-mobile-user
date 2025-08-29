import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '../screens/home/home-page';
// import ProfileScreen from '../screens/profile/profile-page';
// import NotificationScreen from '../screens/notification/notification-page';
// import TicketDetailScreen from '../screens/ticket/ticket-detail-page';
// import TicketQRScreen from '../screens/ticket-qr/ticket-qr-page';
import {MainStackParamList} from '../types/navigation';

const Stack = createStackNavigator<MainStackParamList>();

function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      {/* <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
      <Stack.Screen name="TicketQR" component={TicketQRScreen} /> */}
    </Stack.Navigator>
  );
}

export default MainStack;
