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
    if (!PHONE_REGEX.test(phoneNumber)) {
      setErrors({
        phoneNumber: '올바른 휴대폰 번호 형식이 아닙니다 (예: 01012345678)',
      });
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
    validateVerificationCode,
    clearErrors,
  };
};
