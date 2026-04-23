/**
 * 注册页面：账号、密码、确认密码，手机与邮箱；成功后自动登录
 */
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../store/userSlice';
import {
  Text,
  TextInput,
  Button,
  Title,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';

export default function RegisterScreen({ navigation }) {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.user);

  const handleRegister = async () => {
    if (!account.trim() || !password) {
      Alert.alert('提示', '请输入账号和密码');
      return;
    }
    if (account.trim().length < 3 || account.trim().length > 32) {
      Alert.alert('提示', '账号长度为3-32位');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(account.trim())) {
      Alert.alert('提示', '账号仅支持字母、数字、下划线');
      return;
    }
    if (password.length < 6) {
      Alert.alert('提示', '密码至少6位');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('提示', '两次输入的密码不一致');
      return;
    }
    if (phone.trim() && !/^1\d{10}$/.test(phone.trim())) {
      Alert.alert('提示', '请输入正确的11位手机号');
      return;
    }
    if (!email.trim()) {
      Alert.alert('提示', '请输入邮箱');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('提示', '邮箱格式不正确');
      return;
    }

    try {
      await dispatch(
        register({
          account: account.trim(),
          password,
          confirmPassword,
          phone: phone.trim() || undefined,
          email: email.trim(),
        })
      ).unwrap();
    } catch (err) {
      Alert.alert('注册失败', err || '请检查填写内容');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface} elevation={4}>
          <Title style={styles.title}>注册房东账号</Title>
          <Text style={styles.subtitle}>创建账号后即可管理房源与租约</Text>

          <TextInput
            label="账号"
            value={account}
            onChangeText={setAccount}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="密码"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry
            left={<TextInput.Icon icon="lock" />}
          />

          <TextInput
            label="确认密码"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry
            left={<TextInput.Icon icon="lock-check" />}
            onSubmitEditing={handleRegister}
          />

          <TextInput
            label="手机号（选填）"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
          />

          <TextInput
            label="邮箱"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            left={<TextInput.Icon icon="email" />}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {loading ? <ActivityIndicator color="#fff" /> : '注册并登录'}
          </Button>

          <Button mode="text" onPress={() => navigation.navigate('Login')} style={styles.linkBtn}>
            已有账号？去登录
          </Button>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    padding: 24,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#409EFF',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#409EFF',
  },
  buttonContent: {
    paddingVertical: 6,
  },
  linkBtn: {
    marginTop: 8,
  },
  errorText: {
    color: '#f56c6c',
    marginBottom: 8,
    textAlign: 'center',
  },
});