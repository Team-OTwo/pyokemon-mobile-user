import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import RootNavigator from './navigation/root-navigator';
import AuthProvider from './contexts/auth-provider';
import {NotificationProvider} from './contexts/notification-provider';
import {AgentProvider} from './contexts/agent-provider';
import {GlobalAlertModal} from './components/common';

function App(): JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AuthProvider>
        <AgentProvider>
          <NotificationProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
            <GlobalAlertModal />
          </NotificationProvider>
        </AgentProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default App;
