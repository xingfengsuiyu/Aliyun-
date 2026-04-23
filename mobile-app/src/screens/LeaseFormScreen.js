/**
 * 租约表单页面
 * 新增租约
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Title,
  Surface,
} from 'react-native-paper';
import { leaseAPI, propertyAPI, tenantAPI } from '../api';
import { Picker } from '@react-native-picker/picker';

function DatePicker({ label, value, onChange }) {
  const [visible, setVisible] = useState(false);
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

  const days = [];
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const formatDate = (y, m, d) => {
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const handleConfirm = () => {
    const dateStr = formatDate(selectedYear, selectedMonth, selectedDay);
    onChange(dateStr);
    setVisible(false);
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
    setVisible(true);
  };

  return (
    <>
      <TouchableOpacity onPress={openPicker} style={styles.dateInputContainer}>
        <Text style={styles.dateInputLabel}>{label}</Text>
        <Text style={styles.dateInputValue}>{value || '请选择日期'}</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <View style={styles.datePickerContainer} onStartShouldSetResponder={() => true}>
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
              <Button mode="text" onPress={() => setVisible(false)}>
                取消
              </Button>
              <Button mode="contained" onPress={handleConfirm}>
                确定
              </Button>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export default function LeaseFormScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [propertiesRes, tenantsRes] = await Promise.all([
        propertyAPI.getList({ page: 0, size: 100, status: '空闲' }),
        tenantAPI.getList({ page: 0, size: 100 }),
      ]);

      if (propertiesRes?.code === 200) {
        setProperties(propertiesRes.data?.list || []);
      }
      if (tenantsRes?.code === 200) {
        setTenants(tenantsRes.data?.list || []);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      Alert.alert('提示', '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProperty) {
      Alert.alert('提示', '请选择房源');
      return;
    }
    if (!selectedTenant) {
      Alert.alert('提示', '请选择租客');
      return;
    }
    if (!startDate) {
      Alert.alert('提示', '请选择起租日期');
      return;
    }
    if (!endDate) {
      Alert.alert('提示', '请选择结束日期');
      return;
    }
    if (!rent || parseFloat(rent) <= 0) {
      Alert.alert('提示', '请输入租金');
      return;
    }
    if (!paymentMode) {
      Alert.alert('提示', '请选择付款方式');
      return;
    }

    const data = {
      propertyId: selectedProperty,
      tenantId: selectedTenant,
      startDate,
      endDate,
      rent: parseFloat(rent),
      deposit: deposit ? parseFloat(deposit) : 0,
      paymentMode,
      remark: remark.trim(),
    };

    try {
      setSubmitting(true);
      await leaseAPI.create(data);
      Alert.alert('成功', '创建成功');
      navigation.navigate('Leases');
    } catch (error) {
      console.error('提交失败:', error);
      Alert.alert('失败', '创建失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface} elevation={2}>
          <Title style={styles.title}>新增租约</Title>

          <Text style={styles.label}>选择房源</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedProperty}
              onValueChange={setSelectedProperty}
              style={styles.picker}
            >
              <Picker.Item label="请选择房源" value="" />
              {properties.map((property) => (
                <Picker.Item
                  key={property.id}
                  label={`${property.name} - ${property.address}`}
                  value={property.id}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>选择租客</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedTenant}
              onValueChange={setSelectedTenant}
              style={styles.picker}
            >
              <Picker.Item label="请选择租客" value="" />
              {tenants.map((tenant) => (
                <Picker.Item
                  key={tenant.id}
                  label={`${tenant.name} - ${tenant.phone}`}
                  value={tenant.id}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <DatePicker
                label="起租日期"
                value={startDate}
                onChange={setStartDate}
              />
            </View>
            <View style={styles.halfInput}>
              <DatePicker
                label="结束日期"
                value={endDate}
                onChange={setEndDate}
              />
            </View>
          </View>

          <View style={styles.row}>
            <TextInput
              label="月租金(元)"
              value={rent}
              onChangeText={setRent}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
              placeholder="租金"
            />
            <TextInput
              label="押金(元)"
              value={deposit}
              onChangeText={setDeposit}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
              placeholder="押金"
            />
          </View>

          <Text style={styles.label}>付款方式</Text>
          <View style={styles.paymentContainer}>
            {['押一付一', '押一付三', '半年付', '年付'].map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setPaymentMode(mode)}
                style={[
                  styles.paymentButton,
                  paymentMode === mode && styles.paymentButtonSelected
                ]}
              >
                <Text
                  style={[
                    styles.paymentButtonText,
                    paymentMode === mode && styles.paymentButtonTextSelected
                  ]}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            label="备注"
            value={remark}
            onChangeText={setRemark}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            placeholder="请输入备注"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              disabled={submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? '创建中...' : '创建'}
              </Text>
            </TouchableOpacity>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scrollContent: {
    padding: 15,
  },
  surface: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#409EFF',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 14,
    color: '#606266',
    marginBottom: 8,
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  dateInputContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  dateInputLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  dateInputValue: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
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
  paymentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  paymentButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  paymentButtonSelected: {
    backgroundColor: '#409EFF',
    borderColor: '#409EFF',
  },
  paymentButtonText: {
    color: '#666',
    fontSize: 14,
  },
  paymentButtonTextSelected: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#409EFF',
    borderRadius: 4,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#a0cfff',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
