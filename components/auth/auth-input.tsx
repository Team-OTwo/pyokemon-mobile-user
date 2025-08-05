import { useThemeColor } from '@/hooks/useThemeColor';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

export interface AuthInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
}

export function AuthInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
}: AuthInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  // const backgroundColor = useThemeColor(
  //   { light: '#F8F9FA', dark: '#2A2A2A' },
  //   'background',
  // );
  const textColor = useThemeColor(
    { light: '#11181C', dark: '#ECEDEE' },
    'text',
  );
  const borderColor = useThemeColor(
    { light: '#E1E3E5', dark: '#404040' },
    'background',
  );
  const errorColor = '#FF3B30';

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          { borderColor: error ? errorColor : borderColor },
        ]}
      >
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={useThemeColor(
            { light: '#6C757D', dark: '#ADB5BD' },
            'text',
          )}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            {isPasswordVisible ? (
              <EyeOff
                size={20}
                color={useThemeColor(
                  { light: '#6C757D', dark: '#ADB5BD' },
                  'text',
                )}
              />
            ) : (
              <Eye
                size={20}
                color={useThemeColor(
                  { light: '#6C757D', dark: '#ADB5BD' },
                  'text',
                )}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
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
