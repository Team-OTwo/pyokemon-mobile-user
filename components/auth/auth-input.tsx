import {useThemeColor} from '../../hooks/useThemeColor';
import {formatDate, formatPhoneNumber} from '../../utils/format.utils';
import {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Eye, EyeOff} from 'lucide-react-native';

type InputType = 'default' | 'phone' | 'date';

export interface AuthInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  inputType?: InputType;
  disabled?: boolean;
}

/**
 * 인증 관련 화면에서 사용되는 입력 컴포넌트
 *
 * @param value - 입력 값
 * @param onChangeText - 값 변경 핸들러
 * @param placeholder - 플레이스홀더 텍스트
 * @param secureTextEntry - 비밀번호 입력 여부
 * @param keyboardType - 키보드 타입
 * @param error - 에러 메시지
 * @param inputType - 입력 타입 (기본값, 전화번호, 날짜)
 */
export function AuthInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  inputType = 'default',
  disabled = false,
}: AuthInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const textColor = useThemeColor({light: '#11181C', dark: '#ECEDEE'}, 'text');
  const borderColor = useThemeColor(
    {light: '#E1E3E5', dark: '#404040'},
    'background',
  );
  const errorColor = '#FF3B30';

  /**
   * 입력 타입에 따라 적절한 키보드 타입 반환
   */
  const getKeyboardType = () => {
    switch (inputType) {
      case 'phone':
        return 'phone-pad';
      case 'date':
        return 'numeric';
      default:
        return keyboardType;
    }
  };

  /**
   * 입력값 변경 핸들러
   */
  const handleTextChange = (text: string) => {
    let formattedText = text;

    switch (inputType) {
      case 'phone':
        formattedText = formatPhoneNumber(text);
        break;
      case 'date':
        formattedText = formatDate(text);
        break;
      default:
        formattedText = text;
    }

    onChangeText(formattedText);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          {borderColor: error ? errorColor : borderColor},
        ]}>
        <TextInput
          style={[styles.input, {color: textColor}]}
          value={value}
          editable={!disabled}
          onChangeText={text => handleTextChange(text.trim())}
          placeholder={placeholder}
          placeholderTextColor={useThemeColor(
            {light: '#6C757D', dark: '#ADB5BD'},
            'text',
          )}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={getKeyboardType()}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}>
            {isPasswordVisible ? (
              <EyeOff
                size={20}
                color={useThemeColor(
                  {light: '#6C757D', dark: '#ADB5BD'},
                  'text',
                )}
              />
            ) : (
              <Eye
                size={20}
                color={useThemeColor(
                  {light: '#6C757D', dark: '#ADB5BD'},
                  'text',
                )}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.errorText, {color: errorColor}]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
});
