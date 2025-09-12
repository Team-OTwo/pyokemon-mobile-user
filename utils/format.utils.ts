import decode from 'base64url';
/**
 * 포맷팅 관련 유틸리티 함수
 */

/**
 * 전화번호 포맷팅 함수
 * 입력된 숫자 문자열에 하이픈을 추가하여 전화번호 형식으로 변환
 *
 * @param value - 포맷팅할 전화번호 문자열
 * @returns 하이픈이 포함된 포맷팅된 전화번호
 *
 * @example
 * formatPhoneNumber('01012345678') // '010-1234-5678'
 * formatPhoneNumber('0101234567') // '010-123-4567'
 */

export function base64ToJson(base64: string): Record<string, any> {
  const jsonStr = decode(base64);
  return JSON.parse(jsonStr);
}

export const formatPhoneNumber = (value: string): string => {
  // 숫자만 추출
  const cleaned = value.replace(/\D/g, '');

  // 최대 11자리로 제한
  const truncated = cleaned.slice(0, 11);

  // 길이에 따라 포맷팅 적용
  if (truncated.length < 4) {
    return truncated;
  } else if (truncated.length < 7) {
    return `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
  } else if (truncated.length < 11) {
    return `${truncated.slice(0, 3)}-${truncated.slice(3, 6)}-${truncated.slice(
      6,
    )}`;
  } else {
    return `${truncated.slice(0, 3)}-${truncated.slice(3, 7)}-${truncated.slice(
      7,
    )}`;
  }
};

/**
 * 날짜 포맷팅 함수
 * 입력된 숫자 문자열에 하이픈을 추가하여 YYYY-MM-DD 형식으로 변환
 *
 * @param value - 포맷팅할 날짜 문자열
 * @returns 하이픈이 포함된 포맷팅된 날짜
 *
 * @example
 * formatDate('20230101') // '2023-01-01'
 */
export const formatDate = (value: string): string => {
  // 숫자만 추출
  const cleaned = value.replace(/\D/g, '');

  // 최대 8자리로 제한
  const truncated = cleaned.slice(0, 8);

  // 길이에 따라 포맷팅 적용
  if (truncated.length < 5) {
    return truncated;
  } else if (truncated.length < 7) {
    return `${truncated.slice(0, 4)}-${truncated.slice(4)}`;
  } else {
    return `${truncated.slice(0, 4)}-${truncated.slice(4, 6)}-${truncated.slice(
      6,
    )}`;
  }
};

/**
 * 날짜 유효성 검사 함수
 * YYYY-MM-DD 형식의 날짜가 유효한지 검사
 *
 * @param date - 검사할 날짜 문자열 (YYYY-MM-DD 형식)
 * @returns 유효한 날짜인지 여부
 */
export const isValidDate = (date: string): boolean => {
  // 형식 검사
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  // 날짜 파싱
  const [year, month, day] = date.split('-').map(Number);

  // 유효한 날짜 범위 검사
  if (year < 1900 || year > new Date().getFullYear() + 1) {
    return false;
  }

  if (month < 1 || month > 12) {
    return false;
  }

  // 각 월의 일수 계산 (윤년 고려)
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return day > 0 && day <= daysInMonth[month - 1];
};

/**
 * 전화번호 유효성 검사 함수
 *
 * @param phone - 검사할 전화번호 문자열
 * @returns 유효한 전화번호인지 여부
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  return /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/.test(phone);
};

/**
 * 문자열에서 하이픈 제거
 *
 * @param value - 하이픈을 제거할 문자열
 * @returns 하이픈이 제거된 문자열
 */
export const removeHyphens = (value: string): string => {
  return value.replace(/-/g, '');
};
