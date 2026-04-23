/**
 * 租约详情页面
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Chip,
  Divider,
  ActivityIndicator,
  Portal,
} from 'react-native-paper';
import { leaseAPI } from '../api';
import { CustomAlert } from '../components/GlobalAlert';

const STATUS_COLORS = {
  '草稿': '#909399',
  '生效中': '#67C23A',
  '已到期': '#E6A23C',
  '已终止': '#F56C6C',
  '待续签': '#E6A23C',
};

function DatePickerModal({ label, value, onChange, visible, onDismiss }) {
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

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const formatDate = (y, m, d) => {
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

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
    } else {
      setSelectedYear(new Date().getFullYear());
      setSelectedMonth(new Date().getMonth() + 1);
      setSelectedDay(new Date().getDate());
    }
  };

  useEffect(() => {
    if (visible) {
      openPicker();
    }
  }, [visible, value]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.modalOverlay} onPress={onDismiss}>
        <View style={styles.datePickerContainer} onStartShouldSetResponder={() => true} onTouchStart={(e) => e.stopPropagation()}>
          <Text style={styles.datePickerTitle}>{label}</Text>

          <View style={styles.datePickerRow}>
            <View style={styles.datePickerColumn}>
              <Text style={styles.datePickerColumnTitle}>年</Text>
              <ScrollView style={styles.datePickerScroll}>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.datePickerItem,
                      selectedYear === year && styles.datePickerItemSelected
                    ]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text
                      style={[
                        styles.datePickerItemText,
                        selectedYear === year && styles.datePickerItemTextSelected
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.datePickerColumn}>
              <Text style={styles.datePickerColumnTitle}>月</Text>
              <ScrollView style={styles.datePickerScroll}>
                {months.map((month) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.datePickerItem,
                      selectedMonth === month && styles.datePickerItemSelected
                    ]}
                    onPress={() => {
                      setSelectedMonth(month);
                      const newDaysInMonth = getDaysInMonth(selectedYear, month);
                      if (selectedDay > newDaysInMonth) {
                        setSelectedDay(newDaysInMonth);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.datePickerItemText,
                        selectedMonth === month && styles.datePickerItemTextSelected
                      ]}
                    >
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.datePickerColumn}>
              <Text style={styles.datePickerColumnTitle}>日</Text>
              <ScrollView style={styles.datePickerScroll}>
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.datePickerItem,
                      selectedDay === day && styles.datePickerItemSelected
                    ]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text
                      style={[
                        styles.datePickerItemText,
                        selectedDay === day && styles.datePickerItemTextSelected
                      ]}
                    >
                      {day}
                    </Text>
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
}

export default function LeaseDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [lease, setLease] = useState(null);
  const [terminating, setTerminating] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [renewDialogVisible, setRenewDialogVisible] = useState(false);
  const [renewDatePickerVisible, setRenewDatePickerVisible] = useState(false);
  const [renewEndDate, setRenewEndDate] = useState('');
  const [terminateDialogVisible, setTerminateDialogVisible] = useState(false);
  const [terminateDate, setTerminateDate] = useState('');
  const [terminateDatePickerVisible, setTerminateDatePickerVisible] = useState(false);
  const [terminateReason, setTerminateReason] = useState('');

  const fetchLease = async () => {
    try {
      setLoading(true);
      const res = await leaseAPI.getById(id);
      if (res?.code === 200) {
        setLease(res.data);
      } else {
        CustomAlert.alert('提示', res?.message || '获取租约信息失败');
      }
    } catch (error) {
      console.error('获取租约信息失败:', error);
      CustomAlert.alert('提示', '获取租约信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLease();
  }, [id]);

  const handleTerminate = () => {
    const today = new Date().toISOString().slice(0, 10);
    setTerminateDate(today);
    setTerminateReason('');
    setTerminateDialogVisible(true);
  };

  const doTerminate = async () => {
    if (!terminateDate) {
      CustomAlert.alert('提示', '请选择终止日期');
      return;
    }
    try {
      setTerminating(true);
      const res = await leaseAPI.terminate({
        id: id,
        terminationReason: terminateReason,
        actualTerminationDate: terminateDate
      });
      if (res?.code === 200) {
        CustomAlert.alert('成功', '租约已终止');
        setTerminateDialogVisible(false);
        fetchLease();
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

  const handleRenew = () => {
    setRenewEndDate('');
    setRenewDialogVisible(true);
  };

  const confirmRenew = async () => {
    if (!renewEndDate) {
      setRenewDialogVisible(false);
      CustomAlert.alert('提示', '请选择新结束日期');
      return;
    }
    const oldEndDate = lease?.endDate;
    if (oldEndDate && renewEndDate <= oldEndDate) {
      setRenewDialogVisible(false);
      CustomAlert.alert('提示', '新结束日期必须大于当前结束日期');
      return;
    }
    try {
      setRenewing(true);
      const res = await leaseAPI.renew({
        id: id,
        newLeaseData: {
          endDate: renewEndDate
        }
      });
      if (res?.code === 200) {
        CustomAlert.alert('成功', '续租成功');
        setRenewDialogVisible(false);
        fetchLease();
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

  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || '#909399';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#409EFF" />
      </View>
    );
  }

  if (!lease) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>未找到租约信息</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Title style={styles.title}>租约详情</Title>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(lease.status) }]}
              textStyle={styles.statusText}
            >
              {lease.status}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>房源地址:</Text>
            <Text style={styles.value}>{lease.propertyAddress || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>房源名称:</Text>
            <Text style={styles.value}>{lease.propertyName || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>租客姓名:</Text>
            <Text style={styles.value}>{lease.tenantName || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>租约状态:</Text>
            <Text style={[styles.value, { color: getStatusColor(lease.status) }]}>
              {lease.status}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>开始日期:</Text>
            <Text style={styles.value}>{lease.startDate || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>结束日期:</Text>
            <Text style={styles.value}>{lease.endDate || '-'}</Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>月租金:</Text>
            <Text style={styles.rentText}>¥{lease.rent}/月</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>押金:</Text>
            <Text style={styles.value}>¥{lease.deposit}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>付款方式:</Text>
            <Text style={styles.value}>{lease.paymentMode || '-'}</Text>
          </View>

          {lease.paymentDay && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>付款日:</Text>
              <Text style={styles.value}>每月{lease.paymentDay}日</Text>
            </View>
          )}

          {lease.specialTerms && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.termsContainer}>
                <Text style={styles.label}>特殊条款:</Text>
                <Text style={styles.termsText}>{lease.specialTerms}</Text>
              </View>
            </>
          )}

          {lease.status === '已终止' && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.label}>终止原因:</Text>
                <Text style={styles.value}>{lease.terminationReason || '-'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>实际终止日期:</Text>
                <Text style={styles.value}>{lease.actualTerminationDate || '-'}</Text>
              </View>
            </>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>创建时间:</Text>
            <Text style={styles.value}>{lease.createdAt ? new Date(lease.createdAt).toLocaleString('zh-CN') : '-'}</Text>
          </View>
        </Card.Content>
      </Card>

      {lease.status === '生效中' && (
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleRenew}
            loading={renewing}
            style={styles.renewButton}
          >
            续租
          </Button>
          <Button
            mode="contained"
            onPress={handleTerminate}
            loading={terminating}
            buttonColor="#F56C6C"
            style={styles.terminateButton}
          >
            终止租约
          </Button>
        </View>
      )}

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
                <Button mode="contained" buttonColor="#F56C6C" onPress={doTerminate} loading={terminating}>确定</Button>
              </View>
            </View>
          </View>
        </Modal>

        <DatePickerModal
          label="选择终止日期"
          value={terminateDate}
          onChange={setTerminateDate}
          visible={terminateDatePickerVisible}
          onDismiss={() => setTerminateDatePickerVisible(false)}
        />
      </Portal>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  card: {
    margin: 15,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    color: '#999',
    fontSize: 14,
    width: 100,
  },
  value: {
    color: '#333',
    fontSize: 14,
    flex: 1,
  },
  rentText: {
    color: '#F56C6C',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  termsContainer: {
    marginTop: 5,
  },
  termsText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 15,
  },
  renewButton: {
    flex: 1,
  },
  terminateButton: {
    flex: 1,
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
});
