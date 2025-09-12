import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import {ThemedText} from '../common';

interface LoadingProps {
  size?: number;
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({size = 80, message}) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    spinAnimation.start();
    return () => spinAnimation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../assets/images/loadingBall.png')}
        style={[
          styles.animatedImage,
          {width: size, height: size, transform: [{rotate: spin}]},
        ]}
        resizeMode="contain"
      />
      {message && (
        <View style={styles.messageContainer}>
          <ThemedText style={styles.messageText}>{message}</ThemedText>
        </View>
      )}
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedImage: {
    width: 80,
    height: 80,
  },
  messageContainer: {
    marginTop: 16,
  },
  messageText: {
    fontSize: 16,
    opacity: 0.7,
  },
});
