import Home from "@/screens/home/home-page";
import Login from "@/screens/login/login-page";
import Notification from "@/screens/notification/notification-page";
import Profile from "@/screens/profile/profile-page";
import Signup from "@/screens/signup/signup-page";
import SplashScreen from "@/screens/splash/splash-page";
import TicketDetail from "@/screens/ticket/ticket-detail-page";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";

import { RootStackParamList } from "@/types/navigation";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import TicketQRPage from "./screens/ticket-qr/ticket-qr-page";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  // const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("./assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [isSplashVisible, setIsSplashVisible] = useState<boolean>(true);

  // 폰트 로딩 및 스플래시 화면 처리
  useEffect(() => {
    if (loaded) {
      // 폰트가 로드되면 스플래시 화면을 표시하고 일정 시간 후 숨김
      const timer = setTimeout(() => {
        setIsSplashVisible(false);
      }, 3000); // 스플래시 화면 표시 시간 (3초)
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  if (!loaded) {
    // 폰트 로딩 중
    return null;
  }

  if (isSplashVisible) {
    // 스플래시 화면 표시
    return (
      <View style={{ flex: 1 }}>
        <SplashScreen onFinish={() => setIsSplashVisible(false)} />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Notification" component={Notification} />
        <Stack.Screen name="TicketDetail" component={TicketDetail} />
        <Stack.Screen name="TicketQR" component={TicketQRPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
