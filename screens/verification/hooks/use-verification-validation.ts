import React, { useCallback, useState } from 'react';
import { PHONE_REGEX, VERIFICATION_CODE_LENGTH } from '../constants';
import { ValidationErrors } from '../types';

export const useVerificationValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validatePhoneNumber = useCallback((phoneNumber: string): boolean => {
    if (!phoneNumber) {
      setErrors({ phoneNumber: '휴대폰 번호를 입력해주세요' });
      return false;
    }

    // 하이픈 제거 후 숫자만 추출
    const cleanPhoneNumber = phoneNumber.replace(/-/g, '');

    // 숫자만 있는지 확인
    if (!/^\d+$/.test(cleanPhoneNumber)) {
      setErrors({
        phoneNumber: '휴대폰 번호는 숫자와 하이픈(-)만 입력 가능합니다',
      });
      return false;
    }

    // 길이 확인 (010 + 8자리)
    if (cleanPhoneNumber.length !== 11) {
      setErrors({
        phoneNumber: '휴대폰 번호는 11자리여야 합니다 (예: 010-9960-0464)',
      });
      return false;
    }

    // 010, 011, 016, 017, 018, 019로 시작하는지 확인
    if (!/^01[0-9]/.test(cleanPhoneNumber)) {
      setErrors({
        phoneNumber:
          '휴대폰 번호는 010, 011, 016, 017, 018, 019로 시작해야 합니다',
      });
      return false;
    }

    // 정규식 패턴 확인 (하이픈 포함)
    if (!PHONE_REGEX.test(phoneNumber)) {
      setErrors({
        phoneNumber: '올바른 휴대폰 번호 형식이 아닙니다 (예: 010-9960-0464)',
      });
      return false;
    }

    setErrors({});
    return true;
  }, []);

  const validateName = useCallback((name: string): boolean => {
    if (!name.trim()) {
      setErrors({ name: '이름을 입력해주세요' });
      return false;
    }
    if (name.trim().length < 2) {
      setErrors({ name: '이름은 2자 이상 입력해주세요' });
      return false;
    }
    setErrors({});
    return true;
  }, []);

  const validateBirth = useCallback((birth: string): boolean => {
    if (!birth) {
      setErrors({ birth: '생년월일을 입력해주세요' });
      return false;
    }
    setErrors({});
    return true;
  }, []);

  const validateVerificationCode = useCallback(
    (verificationCode: string): boolean => {
      if (!verificationCode) {
        setErrors({ verificationCode: '인증번호를 입력해주세요' });
        return false;
      }
      if (verificationCode.length !== VERIFICATION_CODE_LENGTH) {
        setErrors({ verificationCode: '인증번호는 6자리입니다' });
        return false;
      }
      setErrors({});
      return true;
    },
    [],
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validatePhoneNumber,
    validateName,
    validateBirth,
    validateVerificationCode,
    clearErrors,
  };
};
