import {ThemedText} from '../../components/common';
import {useThemeColor} from '../../hooks/useThemeColor';
import React, {useEffect, useState, useRef} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashPage({onFinish}: SplashScreenProps) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const fullText = 'Pyokemon';

  const backgroundColor = useThemeColor(
    {light: '#FFFFFF', dark: '#151718'},
    'background',
  );
  const textColor = useThemeColor({light: '#11181C', dark: '#ECEDEE'}, 'text');

  // 화면 크기에 따른 로고 크기 조정
  const {width, height} = Dimensions.get('window');
  const logoWidth = Math.min(width, height) * 0.6;
  const logoHeight = logoWidth * 0.465;

  // 화면 크기에 따른 폰트 크기 조정
  const getFontSize = () => {
    if (Platform.OS !== 'ios') return 48;

    if (width <= 375) {
      return 44;
    } else if (width <= 414) {
      return 48;
    } else {
      return 52;
    }
  };

  // 타이핑 효과
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  useEffect(() => {
    // 배경 페이드인
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();

    // 타이핑 효과 완료 후 메인 애니메이션 시작
    const typingDuration = fullText.length; // 타이핑 완료 시간

    setTimeout(() => {
      // 로고 애니메이션 시퀀스
      Animated.sequence([
        // 로고 등장 애니메이션
        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1.8)),
          }),
          Animated.timing(logoScale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1.8)),
          }),
        ]),
        // 로고 바운스 효과
        Animated.sequence([
          Animated.timing(logoScale, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1.5)),
          }),
          Animated.timing(logoScale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1.5)),
          }),
        ]),

        // 텍스트 페이드인
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start(() => {
        onFinish();
      });
    }, typingDuration + 500); // 타이핑 완료 후 0.5초 대기
  }, []);

  return (
    <View style={[styles.container, {backgroundColor}]}>
      <Animated.View
        style={[styles.backgroundGradient, {opacity: backgroundOpacity}]}
      />
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.contentContainer}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{scale: logoScale}],
              },
            ]}>
            <View style={[styles.logo]}>
              <ThemedText style={styles.logoTitle}>{displayText}</ThemedText>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logo: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 80,
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
    marginTop: 8,
  },
  logoTitle: {
    textAlign: 'center',
    fontSize: 40,
    fontFamily: 'Bungee-Regular',
    fontWeight: '400',
    lineHeight: 80,
    letterSpacing: 2,
    color: '#000000',
  },
  cursor: {
    fontSize: 56,
    color: '#000000',
    fontWeight: 'bold',
  },
});
