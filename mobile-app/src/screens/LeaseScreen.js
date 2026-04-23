/**
 * 租约列表页面
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  FAB,
  Chip,
  Button,
  Portal,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { leaseAPI } from '../api';
import { CustomAlert } from '../components/GlobalAlert';

export default function LeaseScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leases, setLeases] = useState([]);

  const [renewDialogVisible, setRenewDialogVisible] = useState(false);
  const [renewEndDate, setRenewEndDate] = useState('');
  const [renewDatePickerVisible, setRenewDatePickerVisible] = useState(false);
  const [currentRenewLease, setCurrentRenewLease] = useState(null);
  const [renewing, setRenewing] = useState(false);

  const [terminateDialogVisible, setTerminateDialogVisible] = useState(false);
  const [terminateDate, setTerminateDate] = useState('');
  const [terminateDatePickerVisible, setTerminateDatePickerVisible] = useState(false);
  const [terminateReason, setTerminateReason] = useState('');
  const [currentTerminateLease, setCurrentTerminateLease] = useState(null);
  const [terminating, setTerminating] = useState(false);

  const fetchLeases = async () => {
    try {
      const res = await leaseAPI.getList({ page: 0, size: 50 });
      if (res?.code === 200) {
        setLeases(res.data?.list || []);
      }
    } catch (error) {
      console.error('获取租约列表失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLeases();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeases();
  };

  const getStatusColor = (status) => {
    const colorMap = {
      '生效中': '#67C23A',
      '已到期': '#E6A23C',
      '已终止': '#F56C6C',
      '草稿': '#909399',
    };
    return colorMap[status] || '#909399';
  };

  const handleRenew = (item) => {
    setCurrentRenewLease(item);
    setRenewEndDate('');
    setRenewDialogVisible(true);
  };

  const confirmRenew = async () => {
    if (!renewEndDate) {
      setRenewDialogVisible(false);
      CustomAlert.alert('提示', '请选择新结束日期');
      return;
    }
    const oldEndDate = currentRenewLease?.endDate;
    if (oldEndDate && renewEndDate <= oldEndDate) {
      setRenewDialogVisible(false);
      CustomAlert.alert('提示', '新结束日期必须大于当前结束日期');
      return;
    }
    try {
      setRenewing(true);
      const res = await leaseAPI.renew({
        id: currentRenewLease.id,
        newLeaseData: {
          endDate: renewEndDate
        }
      });
      if (res?.code === 200) {
        CustomAlert.alert('成功', '续租成功');
        setRenewDialogVisible(false);
        fetchLeases();
      } else {
        CustomAlert.alert('失败', res?.message || '续租失败');
      }
    } catch (error) {
      console.error('续租失败:', error);
      CustomAlert.alert('失败', error?.message || '续租失败');
    } finally {
      setRenewing(false);
    }
  };

  const handleTerminate = (item) => {
    setCurrentTerminateLease(item);
    const today = new Date().toISOString().slice(0, 10);
    setTerminateDate(today);
    setTerminateReason('');
    setTerminateDialogVisible(true);
  };

  const confirmTerminate = async () => {
    if (!terminateDate) {
      CustomAlert.alert('提示', '请选择终止日期');
      return;
    }
    try {
      setTerminating(true);
      const res = await leaseAPI.terminate({
        id: currentTerminateLease.id,
        terminationReason: terminateReason,
        actualTerminationDate: terminateDate
      });
      if (res?.code === 200) {
        CustomAlert.alert('成功', '租约已终止');
        setTerminateDialogVisible(false);
        fetchLeases();
      } else {
        CustomAlert.alert('失败', res?.message || '终止失败');
      }
    } catch (error) {
      console.error('终止租约失败:', error);
      CustomAlert.alert('失败', error?.message || '终止失败');
    } finally {
      setTerminating(false);
    }
  };

  const DatePickerModal = ({ label, value, onChange, visible, onDismiss }) => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());

    const years = [];
    for (let y = new Date().getFullYear() - 5; y <= new Date().getFullYear() + 10; y++) {
      years.push(y);
    }
    const months = [];
    for (let m = 1; m <= 12; m++) {
      months.push(m);
    }
    const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }

    const formatDate = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const handleConfirm = () => {
      const dateStr = formatDate(selectedYear, selectedMonth, selectedDay);
      onChange(dateStr);
    };

    const openPicker = () => {
      if (value) {
        const parts = value.split('-');
        if (parts.length === 3) {
          setSelectedYear(parseInt(parts[0]));
          setSelectedMonth(parseInt(parts[1]));
          setSelectedDay(parseInt(parts[2]));
        }
      }
    };

    React.useEffect(() => {
      if (visible) openPicker();
    }, [visible, value]);

    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
        <Pressable style={styles.datePickerOverlay} onPress={onDismiss}>
          <View style={styles.datePickerContainer} onStartShouldSetResponder={() => true} onTouchStart={(e) => e.stopPropagation()}>
            <Text style={styles.datePickerTitle}>{label}</Text>
            <View style={styles.datePickerRow}>
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerColumnTitle}>年</Text>
                <ScrollView style={styles.datePickerScroll}>
                  {years.map((year) => (
                    <TouchableOpacity key={year} style={[styles.datePickerItem, selectedYear === year && styles.datePickerItemSelected]} onPress={() => setSelectedYear(year)}>
                      <Text style={[styles.datePickerItemText, selectedYear === year && styles.datePickerItemTextSelected]}>{year}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerColumnTitle}>月</Text>
                <ScrollView style={styles.datePickerScroll}>
                  {months.map((month) => (
                    <TouchableOpacity key={month} style={[styles.datePickerItem, selectedMonth === month && styles.datePickerItemSelected]} onPress={() => {
                      setSelectedMonth(month);
                      const newDaysInMonth = getDaysInMonth(selectedYear, month);
                      if (selectedDay > newDaysInMonth) setSelectedDay(newDaysInMonth);
                    }}>
                      <Text style={[styles.datePickerItemText, selectedMonth === month && styles.datePickerItemTextSelected]}>{month}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerColumnTitle}>日</Text>
                <ScrollView style={styles.datePickerScroll}>
                  {days.map((day) => (
                    <TouchableOpacity key={day} style={[styles.datePickerItem, selectedDay === day && styles.datePickerItemSelected]} onPress={() => setSelectedDay(day)}>
                      <Text style={[styles.datePickerItemText, selectedDay === day && styles.datePickerItemTextSelected]}>{day}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <View style={styles.datePickerButtons}>
              <Button onPress={onDismiss}>取消</Button>
              <Button mode="contained" onPress={() => { handleConfirm(); onDismiss(); }}>确定</Button>
            </View>
          </View>
        </Pressable>
      </Modal>
    );
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Pressable onPress={() => navigation.navigate('LeaseDetail', { id: item.id })}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title style={styles.cardTitle}>{item.propertyAddress}</Title>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
              textStyle={styles.statusText}
            >
              {item.status}
            </Chip>
          </View>
          <Text style={styles.info}>租客: {item.tenantName}</Text>
          <Text style={styles.info}>租期: {item.startDate} 至 {item.endDate}</Text>
          <Text style={styles.rent}>租金: ¥{item.rent}/月</Text>
        </Card.Content>
      </Pressable>
      {item.status === '生效中' && (
        <Card.Actions style={styles.cardActions}>
          <Button mode="text" textColor="#67C23A" onPress={() => handleRenew(item)}>续租</Button>
          <Button mode="text" textColor="#F56C6C" onPress={() => handleTerminate(item)}>终止</Button>
        </Card.Actions>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={leases}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无租约，点击下方按钮创建</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddLease')}
      />

      <Portal>
        <Modal
          visible={renewDialogVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setRenewDialogVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.dialogBox}>
              <Text style={styles.dialogTitle}>续租</Text>
              <View style={styles.dialogContent}>
                <Text style={styles.dialogLabel}>新结束日期</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setRenewDatePickerVisible(true)}
                >
                  <Text style={renewEndDate ? styles.dateInputText : styles.dateInputPlaceholder}>
                    {renewEndDate || '请选择日期'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dialogButtons}>
                <Button onPress={() => setRenewDialogVisible(false)}>取消</Button>
                <Button mode="contained" onPress={confirmRenew} loading={renewing}>确定</Button>
              </View>
            </View>
          </View>
        </Modal>

        <DatePickerModal
          label="选择新结束日期"
          value={renewEndDate}
          onChange={setRenewEndDate}
          visible={renewDatePickerVisible}
          onDismiss={() => setRenewDatePickerVisible(false)}
        />

        <DatePickerModal
          label="选择终止日期"
          value={terminateDate}
          onChange={setTerminateDate}
          visible={terminateDatePickerVisible}
          onDismiss={() => setTerminateDatePickerVisible(false)}
        />

        <Modal
          visible={terminateDialogVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setTerminateDialogVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.dialogBox}>
              <Text style={styles.dialogTitle}>终止租约</Text>
              <View style={styles.dialogContent}>
                <Text style={styles.dialogLabel}>终止日期</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setTerminateDatePickerVisible(true)}
                >
                  <Text style={terminateDate ? styles.dateInputText : styles.dateInputPlaceholder}>
                    {terminateDate || '请选择日期'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dialogContent}>
                <Text style={styles.dialogLabel}>终止原因</Text>
                <TextInput
                  style={[styles.dialogInput, styles.textArea]}
                  value={terminateReason}
                  onChangeText={setTerminateReason}
                  multiline
                  numberOfLines={3}
                  placeholder="请输入终止原因"
                />
              </View>
              <View style={styles.dialogButtons}>
                <Button onPress={() => setTerminateDialogVisible(false)}>取消</Button>
                <Button mode="contained" buttonColor="#F56C6C" onPress={confirmTerminate} loading={terminating}>确定</Button>
              </View>
            </View>
          </View>
        </Modal>
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
  },
  cardTitle: {
    fontSize: 16,
    flex: 1,
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
  rent: {
    color: '#F56C6C',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  terminateBtnContainer: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  terminateBtn: {
    backgroundColor: '#F56C6C',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
  },
  terminateBtnPressed: {
    backgroundColor: '#E04040',
  },
  terminateBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
  cardActions: {
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '85%',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  dialogContent: {
    marginBottom: 15,
  },
  dialogLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dialogInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 10,
  },
  dateInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
  },
  dateInputPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePickerColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  datePickerColumnTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  datePickerScroll: {
    height: 200,
  },
  datePickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  datePickerItemSelected: {
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
  },
  datePickerItemText: {
    fontSize: 16,
    color: '#666',
  },
  datePickerItemTextSelected: {
    color: '#409EFF',
    fontWeight: 'bold',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 10,
  },
});
