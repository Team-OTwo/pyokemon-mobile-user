import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from './screens/home/home-page';
import LoginScreen from './screens/login/login-page';
import SignupScreen from './screens/signup/signup-page';
import ProfileScreen from './screens/profile/profile-page';
import NotificationScreen from './screens/notification/notification-page';
import TicketDetailScreen from './screens/ticket/ticket-detail-page';
import TicketQRScreen from './screens/ticket-qr/ticket-qr-page';
import { RootStackParamList } from './types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Notification" component={NotificationScreen} />
          <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
          <Stack.Screen name="TicketQR" component={TicketQRScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
