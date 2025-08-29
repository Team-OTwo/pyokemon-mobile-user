export interface ValidationRule {
  test: (value: any, additionalData?: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const AUTH_VALIDATION_RULES = {
  loginId: [
    {
      test: (value: string) => !!value,
      message: '아이디를 입력해주세요',
    },
  ],
  password: [
    {
      test: (value: string) => !!value,
      message: '비밀번호를 입력해주세요',
    },
    {
      test: (value: string) => isValidPassword(value),
      message:
        '비밀번호는 최소 8자 이상이어야 하며, 숫자, 문자, 특수문자를 포함해야 합니다',
    },
  ],
  passwordCheck: [
    {
      test: (value: string, password: string) => !!value,
      message: '비밀번호 확인을 입력해주세요',
    },
    {
      test: (value: string, password: string) => value === password,
      message: '비밀번호가 일치하지 않습니다',
    },
  ],
  name: [
    {
      test: (value: string) => !!value,
      message: '이름을 입력해주세요',
    },
  ],
  phone: [
    {
      test: (value: string) => !!value,
      message: '전화번호를 입력해주세요',
    },
    {
      test: (value: string) => isValidPhoneNumber(value),
      message: '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)',
    },
  ],
  birth: [
    {
      test: (value: string) => !!value,
      message: '생년월일을 입력해주세요',
    },
    {
      test: (value: string) => isValidDate(value),
      message: '올바른 생년월일 형식이 아닙니다 (예: 1999-01-01)',
    },
  ],
};

export const validateField = (
  fieldName: string,
  value: any,
  rules: ValidationRule[],
  additionalData?: any,
): string | null => {
  for (const rule of rules) {
    if (!rule.test(value, additionalData)) {
      return rule.message;
    }
  }
  return null;
};

export const validateSignupForm = (formData: {
  loginId: string;
  password: string;
  passwordCheck: string;
  name: string;
  phone: string;
  birth: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  // 각 필드별 검증
  Object.keys(AUTH_VALIDATION_RULES).forEach(fieldName => {
    const rules =
      AUTH_VALIDATION_RULES[fieldName as keyof typeof AUTH_VALIDATION_RULES];
    const value = formData[fieldName as keyof typeof formData];

    let additionalData;
    if (fieldName === 'passwordCheck') {
      additionalData = formData.password;
    }

    const error = validateField(fieldName, value, rules, additionalData);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// 기존 유틸리티 함수들 (기존 파일에서 이동)
const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^010-\d{4}-\d{4}$/;
  return phoneRegex.test(phone);
};

const isValidDate = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

const isValidPassword = (value: string): boolean => {
  const regex1 = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex1.test(value);
};
