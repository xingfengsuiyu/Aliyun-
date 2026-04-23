/**
 * 首页：显示统计信息、待处理事项
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { dashboardAPI, billAPI, leaseAPI } from '../api';

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProperties: 0,
    rentedProperties: 0,
    activeLeases: 0,
    monthlyIncome: 0,
  });
  const [pendingBills, setPendingBills] = useState([]);
  const [expiringLeases, setExpiringLeases] = useState([]);

  const fetchData = async () => {
    try {
      const [statsRes, billsRes, leasesRes] = await Promise.all([
        dashboardAPI.getStatistics(),
        billAPI.getPendingBills(),
        leaseAPI.getExpiringLeases(),
      ]);

      if (statsRes?.code === 200) {
        setStats(statsRes.data || {});
      }
      if (billsRes?.code === 200) {
        setPendingBills(billsRes.data || []);
      }
      if (leasesRes?.code === 200) {
        setExpiringLeases(leasesRes.data || []);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      Alert.alert('提示', '获取数据失败，请检查网络连接');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#409EFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.statCardBlue]}>
            <Card.Content>
              <Text style={styles.statValue}>{stats.totalProperties || 0}</Text>
              <Text style={styles.statLabel}>总房源数</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, styles.statCardGreen]}>
            <Card.Content>
              <Text style={styles.statValue}>{stats.rentedProperties || 0}</Text>
              <Text style={styles.statLabel}>已出租</Text>
            </Card.Content>
          </Card>
        </View>
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.statCardOrange]}>
            <Card.Content>
              <Text style={styles.statValue}>{stats.activeLeases || 0}</Text>
              <Text style={styles.statLabel}>活跃租约</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, styles.statCardRed]}>
            <Card.Content>
              <Text style={styles.statValue}>¥{stats.monthlyIncome || 0}</Text>
              <Text style={styles.statLabel}>本月收入</Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      <Card style={styles.section}>
        <Card.Content>
          <Title style={styles.sectionTitle}>快捷操作</Title>
          <View style={styles.quickActions}>
            <Button
              mode="contained"
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Properties')}
            >
              房源管理
            </Button>
            <Button
              mode="contained"
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Tenants')}
            >
              租客管理
            </Button>
            <Button
              mode="contained"
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Leases')}
            >
              租约管理
            </Button>
            <Button
              mode="contained"
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Bills')}
            >
              账单管理
            </Button>
            <Button
              mode="contained"
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Feedbacks')}
            >
              意见反馈
            </Button>
            <Button
              mode="contained"
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Profile')}
            >
              个人资料
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            待处理事项 ({pendingBills.length + expiringLeases.length})
          </Title>
          {pendingBills.length === 0 && expiringLeases.length === 0 ? (
            <Text style={styles.emptyText}>暂无待处理事项</Text>
          ) : (
            <>
              {pendingBills.slice(0, 3).map((bill, index) => (
                <Chip key={`bill-${index}`} style={styles.chip} icon="currency-usd">
                  待支付账单: ¥{bill.amount} - {bill.propertyAddress}
                </Chip>
              ))}
              {expiringLeases.slice(0, 3).map((lease, index) => (
                <Chip key={`lease-${index}`} style={styles.chip} icon="file-document">
                  即将到期: {lease.propertyAddress} - {lease.endDate}
                </Chip>
              ))}
            </>
          )}
        </Card.Content>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    padding: 15,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
  },
  statCardBlue: {
    backgroundColor: '#409EFF',
  },
  statCardGreen: {
    backgroundColor: '#67C23A',
  },
  statCardOrange: {
    backgroundColor: '#E6A23C',
  },
  statCardRed: {
    backgroundColor: '#F56C6C',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statLabel: {
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionBtn: {
    backgroundColor: '#409EFF',
  },
  chip: {
    marginBottom: 8,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  bottomPadding: {
    height: 20,
  },
});