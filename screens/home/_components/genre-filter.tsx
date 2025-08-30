import {ThemedText} from '../../../components/common';
import {useThemeColor} from '../../../hooks/useThemeColor';
import React from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';

interface GenreFilterProps {
  activeGenre: string | null;
  onGenreChange: (genre: string | null) => void;
}

// 장르 필터 옵션
const GENRE_FILTERS = [
  {label: '전체', value: null},
  {label: '콘서트', value: '콘서트'},
  {label: '뮤지컬', value: '뮤지컬'},
  {label: '연극', value: '연극'},
  {label: '전시회', value: '전시회'},
  {label: '스포츠', value: '스포츠'},
];

export function GenreFilter({activeGenre, onGenreChange}: GenreFilterProps) {
  const tintColor = useThemeColor({light: '#75B8FF', dark: '#75B8FF'}, 'tint');

  const handleGenreFilter = (genre: string | null) => {
    onGenreChange(genre);
  };

  return (
    <View style={styles.filterContainer}>
      <FlatList
        horizontal
        data={GENRE_FILTERS}
        keyExtractor={item => item.label}
        showsHorizontalScrollIndicator={false}
        renderItem={({item}) => (
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeGenre === item.value && {backgroundColor: tintColor},
            ]}
            onPress={() => handleGenreFilter(item.value)}>
            <ThemedText
              style={[
                styles.filterText,
                activeGenre === item.value && {color: '#ffffff'},
              ]}>
              {item.label}
            </ThemedText>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.filterList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    paddingVertical: 16,
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 8,
    marginTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  filterText: {
    fontSize: 16,
    color: '#646568',
    fontWeight: 'bold',
  },
});
