/**
 * 登录页面
 * 提供用户登录功能
 */
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/userSlice';
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.user);

  const handleLogin = async () => {
    if (!account || !password) {
      Alert.alert('提示', '请输入账号和密码');
      return;
    }

    try {
      await dispatch(login({ account, password })).unwrap();
    } catch (err) {
      Alert.alert('登录失败', err || '请检查账号密码');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Icon name="home-city" size={60} color="#fff" />
          </View>
          <Text style={styles.title}>房东租房管理</Text>
          <Text style={styles.subtitle}>高效管理您的房源</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Icon name="account" size={22} color="#909399" />
              <TextInput
                placeholder="请输入账号"
                value={account}
                onChangeText={setAccount}
                mode="flat"
                style={styles.input}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Icon name="lock" size={22} color="#909399" />
              <TextInput
                placeholder="请输入密码"
                value={password}
                onChangeText={setPassword}
                mode="flat"
                style={styles.input}
                underlineColorAndroid="transparent"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
            contentStyle={styles.loginButtonContent}
          >
            {loading ? '' : '登录'}
          </Button>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>还没有账号？</Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              compact
            >
              立即注册
            </Button>
          </View>

          <View style={styles.forgotRow}>
            <Button
              mode="text"
              onPress={() => navigation.navigate('ForgotPassword')}
              compact
            >
              忘记密码？
            </Button>
          </View>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.hintText}>演示账号: admin / admin123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#409EFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 25,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 60,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    height: 50,
    fontSize: 16,
  },
  errorText: {
    color: '#f56c6c',
    marginBottom: 10,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#409EFF',
    borderRadius: 25,
    marginBottom: 15,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -5,
  },
  registerText: {
    color: '#909399',
    fontSize: 14,
  },
  footerSection: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
});