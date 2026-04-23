/**
 * 忘记密码页面
 * 通过邮箱验证重置密码
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
import {
  Text,
  TextInput,
  Button,
  Title,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import { authAPI } from '../api';

export default function ForgotPasswordScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendCode = async () => {
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
      setLoading(true);
      const response = await authAPI.sendCode(email.trim());
      if (response.code === 200) {
        Alert.alert('成功', '验证码已发送，请查收邮件');
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        Alert.alert('失败', response.message || '发送验证码失败');
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
      Alert.alert('失败', '发送验证码失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('提示', '请输入邮箱');
      return;
    }
    if (!code.trim()) {
      Alert.alert('提示', '请输入验证码');
      return;
    }
    if (code.trim().length !== 6) {
      Alert.alert('提示', '验证码为6位数字');
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert('提示', '请输入新密码');
      return;
    }
    if (newPassword.trim().length < 6) {
      Alert.alert('提示', '密码长度至少6位');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('提示', '两次输入的密码不一致');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.resetPassword({
        email: email.trim(),
        verificationCode: code.trim(),
        newPassword: newPassword.trim(),
      });

      if (response.code === 200) {
        Alert.alert('成功', '密码重置成功，请使用新密码登录', [
          { text: '去登录', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('失败', response.message || '重置密码失败');
      }
    } catch (error) {
      console.error('重置密码失败:', error);
      Alert.alert('失败', '重置密码失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface} elevation={4}>
          <Title style={styles.title}>忘记密码</Title>
          <Text style={styles.subtitle}>通过邮箱验证重置密码</Text>

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

          <View style={styles.codeRow}>
            <TextInput
              label="验证码"
              value={code}
              onChangeText={setCode}
              mode="outlined"
              style={styles.codeInput}
              keyboardType="number-pad"
              maxLength={6}
            />
            <Button
              mode="outlined"
              onPress={handleSendCode}
              disabled={countdown > 0 || loading}
              style={styles.codeButton}
            >
              {countdown > 0 ? `${countdown}s后重发` : '发送验证码'}
            </Button>
          </View>

          <TextInput
            label="新密码"
            value={newPassword}
            onChangeText={setNewPassword}
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
          />

          <Button
            mode="contained"
            onPress={handleResetPassword}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            重置密码
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.linkBtn}
          >
            想起密码了？去登录
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
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeInput: {
    flex: 1,
    backgroundColor: '#fff',
  },
  codeButton: {
    marginLeft: 10,
    height: 48,
    justifyContent: 'center',
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
});