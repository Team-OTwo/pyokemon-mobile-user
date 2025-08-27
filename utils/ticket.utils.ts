export interface FilterOption {
  label: string;
  value: string | null;
}

export const FilterOptions: FilterOption[] = [
  { label: '전체', value: null },
  { label: '콘서트', value: '콘서트' },
  { label: '뮤지컬', value: '뮤지컬' },
  { label: '연극', value: '연극' },
  { label: '클래식', value: '클래식' },
  { label: '스포츠', value: '스포츠' },
  { label: '전시회', value: '전시회' },
];

export const getTicketFilters = (type: string) => {
  const option = FilterOptions.find(option => option.value === type);
  return {
    label: option?.label || '기타',
  };
};

// 티켓 상태에 따른 색상
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return { bgColor: '#E6F7E9', textColor: '#228B22' }; // 활성: 연두색 배경, 진한 녹색 텍스트
    case 'upcoming':
      return { bgColor: '#E0F2F7', textColor: '#2196F3' }; // 예정: 연한 하늘색 배경, 파란색 텍스트
    case 'used':
      return { bgColor: '#F0F0F0', textColor: '#757575' }; // 사용됨: 밝은 회색 배경, 중간 회색 텍스트
    case 'completed':
      return { bgColor: '#E8F5E9', textColor: '#607D8B' }; // 완료됨: 매우 연한 녹색-회색 배경, 청회색 텍스트
    case 'expired':
      return { bgColor: '#FCE4EC', textColor: '#D32F2F' }; // 만료됨: 연한 분홍색 배경, 진한 빨간색 텍스트
    case 'cancelled':
      return { bgColor: '#FCE4EC', textColor: '#D32F2F' }; // 취소됨: 연한 분홍색 배경, 진한 빨간색 텍스트
    default:
      return { bgColor: '#F0F0F0', textColor: '#757575' }; // 기본값: 밝은 회색 배경, 중간 회색 텍스트
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return '유효';
    case 'used':
      return '사용';
    case 'expired':
      return '만료';
    case 'cancelled':
      return '취소';
    case 'completed':
      return '완료';
    case 'upcoming':
      return '예정';
    default:
      return '알 수 없음';
  }
};

// 티켓 타입에 따른 아이콘 색상
export const getTypeColor = (type: string) => {
  switch (type) {
    case 'concert':
      return '#7C3AED';
    case 'movie':
      return '#2563EB';
    case 'sports':
      return '#16A34A';
    case 'exhibition':
      return '#EA580C';
    default:
      return '#6B7280';
  }
};
