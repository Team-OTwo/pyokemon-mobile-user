import { ThemedText } from '@/components/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface QRDisplayProps {
  qrData: string;
  title: string;
  infoText: string;
  isChecking?: boolean;
  checkingText?: string;
  onTimeExpired?: () => void;
  showTimer?: boolean;
  initialTime?: number; // 초 단위
}

export default function QRDisplay({
  qrData,
  title,
  infoText,
  isChecking = false,
  checkingText = '입장 확인 중...',
  onTimeExpired,
  showTimer = false,
  initialTime = 180, // 3분 = 180초
}: QRDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const tintColor = useThemeColor(
    { light: '#2E5BFF', dark: '#2E5BFF' },
    'tint',
  );

  // 타이머 로직
  useEffect(() => {
    if (showTimer && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            onTimeExpired?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showTimer, timeLeft, onTimeExpired]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{title}</ThemedText>

      <View style={styles.qrWrapper}>
        {/* <QRCode
          value={qrData}
          size={200}
          color="#000000"
          backgroundColor="#FFFFFF"
        /> */}
      </View>

      {showTimer && (
        <View style={styles.timerContainer}>
          <ThemedText style={styles.timerLabel}>유효 시간</ThemedText>
          <ThemedText
            style={[styles.timer, timeLeft < 30 && styles.timerWarning]}
          >
            {formatTime(timeLeft)}
          </ThemedText>
        </View>
      )}

      {isChecking && (
        <View style={styles.checkingContainer}>
          <ActivityIndicator size="small" color={tintColor} />
          <ThemedText style={styles.checkingText}>{checkingText}</ThemedText>
        </View>
      )}

      <View style={styles.infoContainer}>
        <ThemedText style={styles.infoText}>
          {showTimer
            ? `• 이 QR 코드는 ${formatTime(
                timeLeft,
              )} 동안 유효합니다.\n• 입장 시 게이트 담당자에게 보여주세요.\n• 시간이 만료되면 다시 생성해야 합니다.`
            : infoText}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timerLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  timer: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E5BFF',
  },
  timerWarning: {
    color: '#E53935',
  },
  checkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 12,
    backgroundColor: 'rgba(46, 91, 255, 0.1)',
    borderRadius: 8,
  },
  checkingText: {
    fontSize: 14,
    color: '#2E5BFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  infoContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
