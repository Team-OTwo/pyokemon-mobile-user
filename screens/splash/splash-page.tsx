import { SvgLogo } from "@/components/SvgLogo";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useEffect } from "react";
import { Animated, Dimensions, Easing, Platform, SafeAreaView, StyleSheet, View } from "react-native";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashPage({ onFinish }: SplashScreenProps) {
  const logoOpacity = new Animated.Value(0);
  const logoScale = new Animated.Value(0.3);
  const textOpacity = new Animated.Value(0);

  const backgroundColor = useThemeColor({ light: "#FFFFFF", dark: "#151718" }, "background");
  const textColor = useThemeColor({ light: "#11181C", dark: "#ECEDEE" }, "text");

  // 화면 크기에 따른 로고 크기 조정
  const { width, height } = Dimensions.get("window");
  const logoWidth = Math.min(width, height) * 0.6; // 화면 크기의 60%로 로고 너비 설정
  const logoHeight = logoWidth * 0.465; // SVG 비율 유지 (129:60 = 2.15:1)

  // 화면 크기에 따른 폰트 크기 조정
  const getFontSize = () => {
    if (Platform.OS !== "ios") return 36;

    if (width <= 375) {
      // 작은 화면 (iPhone SE, 8 등)
      return 32;
    } else if (width <= 414) {
      // 중간 화면 (iPhone X, 11 Pro 등)
      return 36;
    } else {
      // 큰 화면 (iPhone 11, 12 Pro Max 등)
      return 40;
    }
  };

  useEffect(() => {
    Animated.sequence([
      // 로고 애니메이션
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
      ]),

      // 텍스트 애니메이션
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        delay: 200,
      }),

      // 대기 시간
      Animated.delay(1000),
    ]).start(() => {
      onFinish();
    });
  }, []);
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.contentContainer}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <SvgLogo width={logoWidth} height={logoHeight} />
          </Animated.View>

          <Animated.View style={[styles.titleContainer, { opacity: textOpacity }]}>
            <ThemedText style={[styles.title, { color: textColor, fontSize: getFontSize() }]}>Pyokemon</ThemedText>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
    justifyContent: "center",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  logo: {
    // 크기는 동적으로 설정됨
  },
  titleContainer: {
    paddingVertical: 12,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
  },
});
