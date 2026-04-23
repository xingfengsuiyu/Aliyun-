/**
 * 租客列表页面
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
  Title,
  Text,
  Button,
  FAB,
  Chip,
  Searchbar,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { tenantAPI } from '../api';

export default function TenantScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTenants = async () => {
    try {
      const res = await tenantAPI.getList({ page: 0, size: 50 });
      if (res?.code === 200) {
        setTenants(res.data?.list || []);
      }
    } catch (error) {
      console.error('获取租客列表失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTenants();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTenants();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchTenants();
      return;
    }
    try {
      setLoading(true);
      const res = await tenantAPI.getList({
        page: 0,
        size: 50,
        name: searchQuery.trim(),
      });
      if (res?.code === 200) {
        setTenants(res.data?.list || []);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveOut = (item) => {
    Alert.alert('提示', `确定要将 ${item.name} 标记为退租吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: async () => {
          try {
            await tenantAPI.markAsMovedOut(item.id);
            Alert.alert('成功', '操作成功');
            fetchTenants();
          } catch (error) {
            console.error('操作失败:', error);
            Alert.alert('失败', '操作失败');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title style={styles.cardTitle}>{item.name}</Title>
          <Chip
            style={[styles.statusChip, { backgroundColor: item.status === '在住' ? '#67C23A' : '#909399' }]}
            textStyle={styles.statusText}
          >
            {item.status}
          </Chip>
        </View>
        <Text style={styles.info}>手机: {item.phone}</Text>
        <Text style={styles.info}>身份证: {item.idCard}</Text>
        {item.emergencyContactName && (
          <Text style={styles.info}>紧急联系人: {item.emergencyContactName} {item.emergencyContactPhone}</Text>
        )}
        <View style={styles.buttonRow}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('EditTenant', { id: item.id })}
            style={styles.actionBtn}
            compact
          >
            编辑
          </Button>
          {item.status === '在住' && (
            <Button
              mode="outlined"
              onPress={() => handleMoveOut(item)}
              style={styles.actionBtn}
              compact
            >
              退租
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="搜索租客姓名"
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={handleSearch}
        style={styles.searchbar}
      />

      <FlatList
        data={tenants}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无租客，点击下方按钮添加</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddTenant')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  searchbar: {
    margin: 15,
    elevation: 2,
  },
  listContent: {
    paddingHorizontal: 15,
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
  },
  cardTitle: {
    fontSize: 16,
  },
  statusChip: {
    height: 26,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
  info: {
    color: '#666',
    marginTop: 4,
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionBtn: {
    marginRight: 10,
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 15,
    bottom: 15,
    backgroundColor: '#409EFF',
  },
});