import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  tintColor: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  tintColor,
}) => (
  <View style={styles.progressContainer}>
    {Array.from({ length: totalSteps }, (_, index) => (
      <View
        key={index}
        style={[
          styles.progressDot,
          {
            backgroundColor: index <= currentStep ? tintColor : '#E0E0E0',
          },
        ]}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 40,
    justifyContent: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
});
