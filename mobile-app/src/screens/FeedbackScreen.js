/**
 * 意见反馈页面
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  FAB,
  Portal,
  Dialog,
  TextInput,
  Chip,
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { feedbackAPI } from '../api';

const FEEDBACK_TYPES = ['功能建议', '系统bug', '体验反馈', '其他'];

export default function FeedbackScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [feedbackType, setFeedbackType] = useState('功能建议');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchFeedbacks = async () => {
    try {
      const res = await feedbackAPI.getList({ page: 0, size: 50 });
      if (res?.code === 200) {
        setFeedbacks(res.data?.list || []);
      }
    } catch (error) {
      console.error('获取反馈列表失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFeedbacks();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeedbacks();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('提示', '请输入标题');
      return;
    }
    if (!content.trim()) {
      Alert.alert('提示', '请输入反馈内容');
      return;
    }

    try {
      setSubmitting(true);
      const res = await feedbackAPI.create({
        feedbackType: feedbackType,
        title: title.trim(),
        content: content.trim(),
      });
      if (res?.code === 200) {
        Alert.alert('成功', '反馈已提交');
        setDialogVisible(false);
        setTitle('');
        setContent('');
        setFeedbackType('功能建议');
        fetchFeedbacks();
      } else {
        Alert.alert('失败', res?.message || '提交失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      Alert.alert('失败', '提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeColor = (type) => {
    const colorMap = {
      '功能建议': '#409EFF',
      '系统bug': '#F56C6C',
      '体验反馈': '#E6A23C',
      '其他': '#909399',
    };
    return colorMap[type] || '#909399';
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Chip
            style={[styles.typeChip, { backgroundColor: getTypeColor(item.feedbackType) }]}
            textStyle={styles.typeText}
          >
            {item.feedbackType}
          </Chip>
          <Text style={styles.timeText}>{item.createdAt}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.content}>{item.content}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={feedbacks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无反馈记录</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setDialogVisible(true)}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>提交反馈</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.pickerLabel}>反馈类型</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={feedbackType}
                onValueChange={(value) => setFeedbackType(value)}
                style={styles.picker}
              >
                {FEEDBACK_TYPES.map((type) => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>
            <TextInput
              label="标题"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="反馈内容"
              value={content}
              onChangeText={setContent}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>取消</Button>
            <Button onPress={handleSubmit} loading={submitting}>提交</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  listContent: {
    padding: 15,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeChip: {
    height: 24,
  },
  typeText: {
    color: '#fff',
    fontSize: 11,
  },
  timeText: {
    color: '#999',
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  content: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#409EFF',
  },
  dialogInput: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 12,
  },
  picker: {
    height: 50,
  },
});
