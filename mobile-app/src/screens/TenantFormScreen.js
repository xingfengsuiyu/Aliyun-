/**
 * 租客表单页面
 * 新增/编辑租客
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Title,
  Surface,
  SegmentedButtons,
} from 'react-native-paper';
import { tenantAPI } from '../api';

export default function TenantFormScreen({ navigation, route }) {
  const tenantId = route.params?.id;
  const isEdit = !!tenantId;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [gender, setGender] = useState('男');
  const [phone, setPhone] = useState('');
  const [idCard, setIdCard] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isEdit) {
      loadTenant();
    }
  }, []);

  const loadTenant = async () => {
    try {
      setLoading(true);
      const res = await tenantAPI.getById(tenantId);
      if (res?.code === 200) {
        const data = res.data;
        setName(data.name || '');
        setGender(data.gender || '男');
        setPhone(data.phone || '');
        setIdCard(data.idCard || '');
        setEmergencyContactName(data.emergencyContactName || '');
        setEmergencyContactPhone(data.emergencyContactPhone || '');
        setNotes(data.notes || '');
      } else {
        Alert.alert('提示', res?.message || '加载租客信息失败');
      }
    } catch (error) {
      Alert.alert('提示', '加载租客信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入姓名');
      return;
    }

    const data = {
      name: name.trim(),
      gender,
      phone: phone.trim(),
      idCard: idCard.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      notes: notes.trim(),
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        await tenantAPI.update({ id: tenantId, tenant: data });
        setSubmitting(false);
        Alert.alert('成功', '更新成功');
        navigation.navigate('Tenants');
      } else {
        await tenantAPI.create(data);
        setSubmitting(false);
        Alert.alert('成功', '创建成功');
        navigation.navigate('Tenants');
      }
    } catch (error) {
      setSubmitting(false);
      Alert.alert('提示', '保存失败，请稍后重试');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface} elevation={2}>
          <Title style={styles.title}>{isEdit ? '编辑租客' : '新增租客'}</Title>

          <TextInput
            label="姓名"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            placeholder="请输入姓名"
          />

          <Text style={styles.label}>性别</Text>
          <SegmentedButtons
            value={gender}
            onValueChange={setGender}
            buttons={[
              { value: '男', label: '男' },
              { value: '女', label: '女' },
            ]}
            style={styles.segmented}
          />

          <TextInput
            label="手机号"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            placeholder="请输入手机号"
          />

          <TextInput
            label="身份证号"
            value={idCard}
            onChangeText={setIdCard}
            mode="outlined"
            style={styles.input}
            autoCapitalize="characters"
            placeholder="请输入身份证号"
          />

          <TextInput
            label="紧急联系人姓名"
            value={emergencyContactName}
            onChangeText={setEmergencyContactName}
            mode="outlined"
            style={styles.input}
            placeholder="请输入紧急联系人姓名"
          />

          <TextInput
            label="紧急联系人电话"
            value={emergencyContactPhone}
            onChangeText={setEmergencyContactPhone}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            placeholder="请输入紧急联系人电话"
          />

          <TextInput
            label="备注"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            placeholder="请输入备注信息"
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            >
              取消
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
              style={styles.submitButton}
            >
              {isEdit ? '更新' : '创建'}
            </Button>
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
  segmented: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#409EFF',
  },
});