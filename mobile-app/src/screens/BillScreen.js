/**
 * 账单列表页面
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
  TextInput,
  Modal,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Chip,
  ActivityIndicator,
  FAB,
  Portal,
  Dialog,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { billAPI, leaseAPI } from '../api';
import { CustomAlert } from '../components/GlobalAlert';

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

export default function BillScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bills, setBills] = useState([]);
  const [leaseList, setLeaseList] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [payDialogVisible, setPayDialogVisible] = useState(false);
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [leaseDropdownVisible, setLeaseDropdownVisible] = useState(false);
  const [addLeaseId, setAddLeaseId] = useState('');
  const [addBillType, setAddBillType] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [addDueDate, setAddDueDate] = useState('');
  const [addDueDatePickerVisible, setAddDueDatePickerVisible] = useState(false);
  const [paidAmount, setPaidAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const BILL_TYPE_OPTIONS = ['租金', '押金', '物业费', '水电费', '维修费', '其他'];

  const fetchBills = async () => {
    try {
      const res = await billAPI.getList({ page: 0, size: 100 });
      if (res?.code === 200) {
        setBills(res.data?.list || []);
      }
    } catch (error) {
      console.error('获取账单列表失败:', error);
      Alert.alert('提示', '获取账单列表失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLeaseList = async () => {
    try {
      const res = await leaseAPI.getList({ page: 0, size: 100 });
      if (res?.code === 200) {
        setLeaseList(res.data?.list || []);
      }
    } catch (error) {
      console.error('获取租约列表失败:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBills();
      fetchLeaseList();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBills();
  };

  const getStatusColor = (status) => {
    const colorMap = {
      '待支付': '#E6A23C',
      '已支付': '#67C23A',
      '逾期': '#F56C6C',
    };
    return colorMap[status] || '#909399';
  };

  const handlePay = (bill) => {
    setSelectedBill(bill);
    setPaidAmount(bill.amount.toString());
    setPayDialogVisible(true);
  };

  const handleCreate = () => {
    setAddLeaseId('');
    setAddBillType('');
    setAddAmount('');
    setAddDueDate('');
    setAddDialogVisible(true);
  };

  const handleLeaseChange = (leaseId) => {
    const lease = leaseList.find(l => l.id === leaseId);
    if (lease) {
      setAddAmount(lease.rent ? String(lease.rent) : '');
    }
  };

  const handleSubmitAdd = async () => {
    if (!addLeaseId) {
      CustomAlert.alert('提示', '请选择租约');
      return;
    }
    if (!addBillType) {
      CustomAlert.alert('提示', '请选择账单类型');
      return;
    }
    if (!addDueDate) {
      CustomAlert.alert('提示', '请选择到期日期');
      return;
    }
    if (!addAmount || parseFloat(addAmount) <= 0) {
      CustomAlert.alert('提示', '请输入金额');
      return;
    }
    try {
      setSubmitting(true);
      const lease = leaseList.find(l => l.id === addLeaseId);
      const res = await billAPI.create({
        leaseId: addLeaseId,
        propertyId: lease?.propertyId || lease?.property_id,
        tenantId: lease?.tenantId || lease?.tenant_id,
        billType: addBillType,
        amount: parseFloat(addAmount),
        dueDate: addDueDate,
        status: '待支付'
      });
      if (res?.code === 200) {
        CustomAlert.alert('成功', '账单添加成功');
        setAddDialogVisible(false);
        fetchBills();
      } else {
        CustomAlert.alert('失败', res?.message || '添加失败');
      }
    } catch (error) {
      console.error('添加账单失败:', error);
      CustomAlert.alert('失败', '添加失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = (bill) => {
    setSelectedBill(bill);
    setViewDialogVisible(true);
  };

  const handleDelete = (bill) => {
    CustomAlert.alert(
      '删除确认',
      `确定要删除这条账单吗？删除后无法恢复。\n\n房源：${bill.propertyAddress}\n租客：${bill.tenantName}\n金额：¥${bill.amount}\n到期日期：${bill.dueDate}`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await billAPI.delete(bill.id);
              if (res?.code === 200) {
                CustomAlert.alert('成功', '删除成功');
                fetchBills();
              } else {
                CustomAlert.alert('失败', res?.message || '删除失败');
              }
            } catch (error) {
              console.error('删除账单失败:', error);
              CustomAlert.alert('失败', '删除失败');
            }
          }
        }
      ]
    );
  };

  const confirmPayment = async () => {
    if (!selectedBill) return;
    try {
      const res = await billAPI.recordPayment({
        id: selectedBill.id,
        paymentData: {
          paidAmount: parseFloat(paidAmount),
          paymentMethod: '移动支付',
          paidDate: new Date().toISOString().slice(0, 10),
        },
      });
      if (res?.code === 200) {
        Alert.alert('成功', '收款记录成功');
        setPayDialogVisible(false);
        fetchBills();
      } else {
        Alert.alert('失败', res?.message || '收款记录失败');
      }
    } catch (error) {
      console.error('收款失败:', error);
      Alert.alert('失败', '收款记录失败');
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
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
        <Text style={styles.tenant}>租客: {item.tenantName}</Text>
        <View style={styles.infoRow}>
          <Chip icon="file-document" style={styles.typeChip}>{item.billType}</Chip>
          <Text style={styles.amount}>¥{item.amount}</Text>
        </View>
        <Text style={styles.dueDate}>到期日期: {item.dueDate}</Text>
        <View style={styles.actionRow}>
          <Button mode="text" onPress={() => handleView(item)}>查看</Button>
          {item.status === '待支付' && (
            <Button mode="text" textColor="#67C23A" onPress={() => handlePay(item)}>收款</Button>
          )}
          <Button mode="text" textColor="#F56C6C" onPress={() => handleDelete(item)}>删除</Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && bills.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#409EFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bills}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无账单</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreate}
      />

      <Portal>
        <Modal visible={addDialogVisible} onDismiss={() => setAddDialogVisible(false)}>
          <View style={styles.addDialogBox}>
            <Text style={styles.addDialogTitle}>添加账单</Text>
            <ScrollView style={styles.addDialogContent}>
              <Text style={styles.dialogLabel}>选择租约</Text>
              <TouchableOpacity
                style={styles.dropdownInput}
                onPress={() => setLeaseDropdownVisible(true)}
              >
                <Text style={addLeaseId ? styles.dropdownInputText : styles.dropdownInputPlaceholder}>
                  {addLeaseId ? leaseList.find(l => l.id === addLeaseId)?.propertyAddress + ' - ' + leaseList.find(l => l.id === addLeaseId)?.tenantName : '请选择租约'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.dialogLabel}>账单类型</Text>
              <View style={styles.selectContainer}>
                {BILL_TYPE_OPTIONS.map((type) => (
                  <Pressable
                    key={type}
                    style={[styles.selectItem, addBillType === type && styles.selectItemActive]}
                    onPress={() => setAddBillType(type)}
                  >
                    <Text style={[styles.selectItemText, addBillType === type && styles.selectItemTextActive]}>
                      {type}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.dialogLabel}>到期日期</Text>
              <TouchableOpacity
                style={styles.dropdownInput}
                onPress={() => setAddDueDatePickerVisible(true)}
              >
                <Text style={addDueDate ? styles.dropdownInputText : styles.dropdownInputPlaceholder}>
                  {addDueDate || '请选择日期'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.dialogLabel}>金额</Text>
              <TextInput
                style={styles.amountInput}
                value={addAmount}
                onChangeText={setAddAmount}
                keyboardType="numeric"
                placeholder="请输入金额"
              />
            </ScrollView>
            <View style={styles.addDialogFooter}>
              <Button mode="outlined" onPress={() => setAddDialogVisible(false)}>取消</Button>
              <Button mode="contained" onPress={handleSubmitAdd} loading={submitting}>确认添加</Button>
            </View>
          </View>
        </Modal>

        <Modal visible={leaseDropdownVisible} transparent animationType="fade" onRequestClose={() => setLeaseDropdownVisible(false)}>
          <Pressable style={styles.dropdownOverlay} onPress={() => setLeaseDropdownVisible(false)}>
            <View style={styles.dropdownContainer} onStartShouldSetResponder={() => true} onTouchStart={(e) => e.stopPropagation()}>
              <Text style={styles.dropdownTitle}>选择租约</Text>
              <ScrollView style={styles.dropdownScroll}>
                {leaseList.map((lease) => (
                  <TouchableOpacity
                    key={lease.id}
                    style={[styles.dropdownItem, addLeaseId === lease.id && styles.dropdownItemActive]}
                    onPress={() => {
                      setAddLeaseId(lease.id);
                      handleLeaseChange(lease.id);
                      setLeaseDropdownVisible(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, addLeaseId === lease.id && styles.dropdownItemTextActive]}>
                      {lease.propertyAddress} - {lease.tenantName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>

        <DatePickerModal
          label="选择到期日期"
          value={addDueDate}
          onChange={setAddDueDate}
          visible={addDueDatePickerVisible}
          onDismiss={() => setAddDueDatePickerVisible(false)}
        />

        <Modal visible={viewDialogVisible} onDismiss={() => setViewDialogVisible(false)}>
          <View style={styles.viewDialogBox}>
            <Text style={styles.viewDialogTitle}>账单详情</Text>
            <ScrollView style={styles.viewDialogContent}>
              <View style={styles.viewDialogRow}>
                <Text style={styles.viewDialogLabel}>房源地址:</Text>
                <Text style={styles.viewDialogValue}>{selectedBill?.propertyAddress}</Text>
              </View>
              <View style={styles.viewDialogRow}>
                <Text style={styles.viewDialogLabel}>租客:</Text>
                <Text style={styles.viewDialogValue}>{selectedBill?.tenantName}</Text>
              </View>
              <View style={styles.viewDialogRow}>
                <Text style={styles.viewDialogLabel}>账单类型:</Text>
                <Text style={styles.viewDialogValue}>{selectedBill?.billType}</Text>
              </View>
              <View style={styles.viewDialogRow}>
                <Text style={styles.viewDialogLabel}>金额:</Text>
                <Text style={[styles.viewDialogValue, styles.viewDialogAmount]}>¥{selectedBill?.amount}</Text>
              </View>
              <View style={styles.viewDialogRow}>
                <Text style={styles.viewDialogLabel}>到期日期:</Text>
                <Text style={styles.viewDialogValue}>{selectedBill?.dueDate}</Text>
              </View>
              <View style={styles.viewDialogRow}>
                <Text style={styles.viewDialogLabel}>状态:</Text>
                <Chip
                  style={[styles.viewDialogStatusChip, { backgroundColor: getStatusColor(selectedBill?.status) }]}
                  textStyle={styles.viewDialogStatusText}
                >
                  {selectedBill?.status}
                </Chip>
              </View>
              {selectedBill?.paidAmount && (
                <View style={styles.viewDialogRow}>
                  <Text style={styles.viewDialogLabel}>已付金额:</Text>
                  <Text style={styles.viewDialogValue}>¥{selectedBill.paidAmount}</Text>
                </View>
              )}
              {selectedBill?.paidDate && (
                <View style={styles.viewDialogRow}>
                  <Text style={styles.viewDialogLabel}>支付日期:</Text>
                  <Text style={styles.viewDialogValue}>{selectedBill.paidDate}</Text>
                </View>
              )}
              {selectedBill?.paymentMethod && (
                <View style={styles.viewDialogRow}>
                  <Text style={styles.viewDialogLabel}>支付方式:</Text>
                  <Text style={styles.viewDialogValue}>{selectedBill.paymentMethod}</Text>
                </View>
              )}
              {selectedBill?.remark && (
                <View style={styles.viewDialogRow}>
                  <Text style={styles.viewDialogLabel}>备注:</Text>
                  <Text style={styles.viewDialogValue}>{selectedBill.remark}</Text>
                </View>
              )}
            </ScrollView>
            <View style={styles.viewDialogFooter}>
              <Button mode="contained" onPress={() => setViewDialogVisible(false)}>关闭</Button>
            </View>
          </View>
        </Modal>

        <Dialog visible={payDialogVisible} onDismiss={() => setPayDialogVisible(false)}>
          <Dialog.Title>记录收款</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>房源: {selectedBill?.propertyAddress}</Text>
            <Text style={styles.dialogText}>应付金额: ¥{selectedBill?.amount}</Text>
            <TextInput
              style={styles.payAmountInput}
              value={paidAmount}
              onChangeText={setPaidAmount}
              keyboardType="numeric"
              placeholder="请输入实收金额"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPayDialogVisible(false)}>取消</Button>
            <Button onPress={confirmPayment}>确认</Button>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 15,
    paddingBottom: 20,
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
  tenant: {
    color: '#666',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  typeChip: {
    height: 26,
  },
  amount: {
    color: '#F56C6C',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dueDate: {
    color: '#999',
    marginTop: 8,
  },
  payBtn: {
    marginTop: 12,
    backgroundColor: '#67C23A',
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
  },
  dialogText: {
    marginBottom: 8,
  },
  payAmountInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 10,
    marginTop: 10,
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  viewDialogBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
  },
  viewDialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  viewDialogContent: {
    maxHeight: 400,
  },
  viewDialogRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  viewDialogLabel: {
    width: 90,
    color: '#999',
    fontSize: 14,
  },
  viewDialogValue: {
    flex: 1,
    color: '#333',
    fontSize: 14,
  },
  viewDialogAmount: {
    color: '#F56C6C',
    fontWeight: 'bold',
  },
  viewDialogStatusChip: {
    height: 24,
  },
  viewDialogStatusText: {
    color: '#fff',
    fontSize: 12,
  },
  viewDialogFooter: {
    marginTop: 15,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 15,
    bottom: 15,
    backgroundColor: '#409EFF',
  },
  addDialogBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
  },
  addDialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  addDialogContent: {
    maxHeight: 450,
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  selectItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 4,
  },
  selectItemActive: {
    backgroundColor: '#409EFF',
    borderColor: '#409EFF',
  },
  selectItemText: {
    fontSize: 14,
    color: '#666',
  },
  selectItemTextActive: {
    color: '#fff',
  },
  dropdownInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 10,
    justifyContent: 'center',
    marginBottom: 15,
  },
  dropdownInputText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownInputPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
  amountInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 14,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '85%',
    maxHeight: '60%',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  dropdownScroll: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemActive: {
    backgroundColor: '#E3F2FD',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownItemTextActive: {
    color: '#409EFF',
    fontWeight: 'bold',
  },
  dialogLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginTop: 8,
  },
  addDialogFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 15,
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