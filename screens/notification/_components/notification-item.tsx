import { ThemedText } from '@/components/common';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NotificationItem = ({ notification }: { notification: any }) => {
  return (
    <TouchableOpacity style={styles.container}>
      <View>
        <ThemedText style={styles.title} type="defaultSemiBold">
          {notification.title}
        </ThemedText>
        <ThemedText style={styles.body} type="subtitle">
          {notification.message}
        </ThemedText>
        <ThemedText style={styles.date} type="default">
          {notification.created_at}
        </ThemedText>
      </View>
      <View>
        <Text style={styles.dot}>{notification.is_checked ? '' : '●'}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  body: {
    fontSize: 14,
  },
  date: {
    fontSize: 12,
    color: 'gray',
  },
  dot: {
    fontSize: 12,
    color: '#75B8FF',
  },
});
