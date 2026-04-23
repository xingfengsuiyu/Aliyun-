/**
 * 个人资料页面
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Title,
  Surface,
  Divider,
} from 'react-native-paper';
import { authAPI } from '../api';

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [account, setAccount] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getMe();
      if (res?.code === 200) {
        const data = res.data;
        setAccount(data.account || '');
        setName(data.name || '');
        setPhone(data.phone || '');
        setEmail(data.email || '');
      }
    } catch (error) {
      console.error('获取资料失败:', error);
      Alert.alert('提示', '获取个人资料失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (newPassword && !oldPassword) {
      Alert.alert('提示', '修改密码需要输入原密码');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      Alert.alert('提示', '新密码长度至少6位');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('提示', '两次输入的密码不一致');
      return;
    }

    const updateData = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
    };

    if (oldPassword && newPassword) {
      updateData.oldPassword = oldPassword;
      updateData.newPassword = newPassword;
    }

    try {
      setSubmitting(true);
      const res = await authAPI.updateProfile(updateData);
      if (res?.code === 200) {
        Alert.alert('成功', '保存成功');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        fetchProfile();
      } else {
        Alert.alert('失败', res?.message || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      Alert.alert('失败', '保存失败，请稍后重试');
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
          <Title style={styles.title}>个人资料</Title>

          <TextInput
            label="账号"
            value={account}
            mode="outlined"
            style={styles.input}
            disabled
          />

          <TextInput
            label="姓名"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            placeholder="请输入姓名"
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
            label="邮箱"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="请输入邮箱"
          />

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>修改密码</Title>

          <TextInput
            label="原密码"
            value={oldPassword}
            onChangeText={setOldPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry
            placeholder="请输入原密码"
          />

          <TextInput
            label="新密码"
            value={newPassword}
            onChangeText={setNewPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry
            placeholder="请输入新密码（至少6位）"
          />

          <TextInput
            label="确认密码"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry
            placeholder="请再次输入新密码"
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
              style={styles.submitButton}
            >
              保存修改
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
  divider: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 15,
    color: '#303133',
  },
  buttonContainer: {
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#409EFF',
  },
});