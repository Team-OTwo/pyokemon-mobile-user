import { useThemeColor } from '@/hooks/useThemeColor';
import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
} from 'react-native';
import { AuthInput } from './auth-input';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  error?: string;
  maxDate?: Date;
  minDate?: Date;
  label?: string;
}

interface SelectOption {
  label: string;
  value: string;
}

type SelectType = 'year' | 'month' | 'day';

/**
 * 생년월일 선택 컴포넌트
 * 년/월/일 선택 드롭다운으로 구성
 */
export function DatePicker({
  value,
  onChange,
  error,
  maxDate = new Date(),
  minDate = new Date(1900, 0, 1),
  label = '생년월일',
}: DatePickerProps) {
  // 선택된 년/월/일 상태
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');

  // 모달 표시 상태
  const [selectType, setSelectType] = useState<SelectType | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 테마 색상
  const backgroundColor = useThemeColor(
    { light: '#FFFFFF', dark: '#151718' },
    'background',
  );
  const textColor = useThemeColor(
    { light: '#11181C', dark: '#ECEDEE' },
    'text',
  );
  const tintColor = useThemeColor(
    { light: '#2E5BFF', dark: '#2E5BFF' },
    'tint',
  );
  const borderColor = useThemeColor(
    { light: '#E1E3E5', dark: '#404040' },
    'background',
  );
  const placeholderColor = useThemeColor(
    { light: '#6C757D', dark: '#ADB5BD' },
    'text',
  );
  const errorColor = '#FF3B30';

  // 초기 값 설정
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-');
      setSelectedYear(year);
      setSelectedMonth(month);
      setSelectedDay(day);
    }
  }, []);

  // 년도 옵션 생성
  const getYearOptions = (): SelectOption[] => {
    const currentYear = maxDate.getFullYear();
    const minYear = minDate.getFullYear();
    const years: SelectOption[] = [];

    for (let year = currentYear; year >= minYear; year--) {
      years.push({
        label: `${year}년`,
        value: year.toString(),
      });
    }

    return years;
  };

  // 월 옵션 생성
  const getMonthOptions = (): SelectOption[] => {
    const months: SelectOption[] = [];

    for (let month = 1; month <= 12; month++) {
      const monthStr = month.toString().padStart(2, '0');
      months.push({
        label: `${monthStr}월`,
        value: monthStr,
      });
    }

    return months;
  };

  // 일 옵션 생성 (해당 년월의 일수 계산)
  const getDayOptions = (): SelectOption[] => {
    const days: SelectOption[] = [];

    if (!selectedYear || !selectedMonth) {
      return days;
    }

    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);

    // 해당 월의 마지막 날짜 계산
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
    const lastDay = daysInMonth[month - 1];

    for (let day = 1; day <= lastDay; day++) {
      const dayStr = day.toString().padStart(2, '0');
      days.push({
        label: `${dayStr}일`,
        value: dayStr,
      });
    }

    return days;
  };

  // 옵션 선택 핸들러
  const handleSelectOption = (option: SelectOption) => {
    if (!selectType) return;

    switch (selectType) {
      case 'year':
        setSelectedYear(option.value);
        break;
      case 'month':
        setSelectedMonth(option.value);
        break;
      case 'day':
        setSelectedDay(option.value);
        break;
    }

    setIsModalVisible(false);

    // 날짜가 모두 선택되었으면 onChange 호출
    setTimeout(() => {
      const newYear = selectType === 'year' ? option.value : selectedYear;
      const newMonth = selectType === 'month' ? option.value : selectedMonth;
      const newDay = selectType === 'day' ? option.value : selectedDay;

      if (newYear && newMonth && newDay) {
        onChange(`${newYear}-${newMonth}-${newDay}`);
      }
    }, 100);
  };

  // 선택 모달 열기
  const openSelectModal = (type: SelectType) => {
    setSelectType(type);
    setIsModalVisible(true);
  };

  // 현재 선택된 옵션에 따라 표시할 옵션 목록 반환
  const getOptions = (): SelectOption[] => {
    switch (selectType) {
      case 'year':
        return getYearOptions();
      case 'month':
        return getMonthOptions();
      case 'day':
        return getDayOptions();
      default:
        return [];
    }
  };

  // 선택된 날짜를 표시 형식으로 변환
  const getDisplayDate = (): string => {
    if (!selectedYear && !selectedMonth && !selectedDay) {
      return '';
    }

    const yearText = selectedYear ? `${selectedYear}년` : '';
    const monthText = selectedMonth ? ` ${selectedMonth}월` : '';
    const dayText = selectedDay ? ` ${selectedDay}일` : '';

    return `${yearText}${monthText}${dayText}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        {error && (
          <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
        )}
      </View>

      <View style={styles.selectContainer}>
        <TouchableOpacity
          style={[
            styles.selectButton,
            { borderColor: error ? errorColor : borderColor },
          ]}
          onPress={() => openSelectModal('year')}
        >
          <Text
            style={[
              styles.selectText,
              { color: selectedYear ? textColor : placeholderColor },
            ]}
          >
            {selectedYear ? `${selectedYear}년` : '년도'}
          </Text>
          <Text style={[styles.selectArrow, { color: tintColor }]}>▼</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.selectButton,
            { borderColor: error ? errorColor : borderColor },
            !selectedYear && styles.disabledButton,
          ]}
          onPress={() => selectedYear && openSelectModal('month')}
          disabled={!selectedYear}
        >
          <Text
            style={[
              styles.selectText,
              {
                color:
                  selectedYear && selectedMonth ? textColor : placeholderColor,
              },
            ]}
          >
            {selectedMonth ? `${selectedMonth}월` : '월'}
          </Text>
          <Text style={[styles.selectArrow, { color: tintColor }]}>▼</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.selectButton,
            { borderColor: error ? errorColor : borderColor },
            (!selectedYear || !selectedMonth) && styles.disabledButton,
          ]}
          onPress={() =>
            selectedYear && selectedMonth && openSelectModal('day')
          }
          disabled={!selectedYear || !selectedMonth}
        >
          <Text
            style={[
              styles.selectText,
              {
                color:
                  selectedYear && selectedMonth && selectedDay
                    ? textColor
                    : placeholderColor,
              },
            ]}
          >
            {selectedDay ? `${selectedDay}일` : '일'}
          </Text>
          <Text style={[styles.selectArrow, { color: tintColor }]}>▼</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsModalVisible(false)}
        >
          <View
            style={[styles.modalContainer, { backgroundColor }]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                {selectType === 'year'
                  ? '년도 선택'
                  : selectType === 'month'
                  ? '월 선택'
                  : '일 선택'}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={[styles.closeButton, { color: tintColor }]}>
                  닫기
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={getOptions()}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    ((selectType === 'year' && item.value === selectedYear) ||
                      (selectType === 'month' &&
                        item.value === selectedMonth) ||
                      (selectType === 'day' && item.value === selectedDay)) && [
                      styles.selectedOption,
                      { backgroundColor: `${tintColor}20` },
                    ],
                  ]}
                  onPress={() => handleSelectOption(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: textColor },
                      ((selectType === 'year' && item.value === selectedYear) ||
                        (selectType === 'month' &&
                          item.value === selectedMonth) ||
                        (selectType === 'day' &&
                          item.value === selectedDay)) && {
                        color: tintColor,
                        fontWeight: '600',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={true}
              style={styles.optionsList}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '400',
  },
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginRight: 6,
  },
  disabledButton: {
    opacity: 0.5,
    borderColor: '#ccc',
  },
  selectText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectArrow: {
    fontSize: 10,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '500',
    padding: 4,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedOption: {
    backgroundColor: 'rgba(46, 91, 255, 0.1)',
  },
  optionText: {
    fontSize: 16,
  },
});
