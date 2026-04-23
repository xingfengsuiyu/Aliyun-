/**
 * 应用路由导航配置
 * 管理所有页面的路由和导航逻辑
 * 使用抽屉导航实现侧边栏可收缩功能
 */
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { loadUser } from '../store/userSlice';
import { ActivityIndicator, View, TouchableOpacity, Text, Modal, Animated, StyleSheet, Dimensions, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import PropertiesScreen from '../screens/PropertiesScreen';
import PropertyFormScreen from '../screens/PropertyFormScreen';
import TenantScreen from '../screens/TenantScreen';
import TenantFormScreen from '../screens/TenantFormScreen';
import LeaseScreen from '../screens/LeaseScreen';
import LeaseFormScreen from '../screens/LeaseFormScreen';
import LeaseDetailScreen from '../screens/LeaseDetailScreen';
import BillScreen from '../screens/BillScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CustomHeader from '../components/CustomHeader';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const menuItems = [
  { name: '首页', route: 'HomeTab', icon: 'home' },
  { name: '房源管理', route: 'Properties', icon: 'office-building' },
  { name: '租客管理', route: 'Tenants', icon: 'account-group' },
  { name: '租约管理', route: 'Leases', icon: 'file-document' },
  { name: '账单管理', route: 'Bills', icon: 'cash-multiple' },
  { name: '意见反馈', route: 'Feedbacks', icon: 'message-text' },
  { name: '个人资料', route: 'Profile', icon: 'account-cog' },
];

function DrawerContent({ navigation, currentRoute, onClose }) {
  const dispatch = useDispatch();

  const handleMenuPress = (route) => {
    onClose();
    if (route === 'HomeTab') {
      navigation.navigate('Home');
    } else {
      navigation.navigate(route);
    }
  };

  const handleLogout = async () => {
    onClose();
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userInfo');
    dispatch({ type: 'user/logout' });
  };

  const isActive = (route) => {
    if (route === 'HomeTab') {
      return currentRoute === 'Home';
    }
    return currentRoute === route;
  };

  return (
    <View style={drawerStyles.container}>
      <View style={drawerStyles.header}>
        <View style={drawerStyles.avatar}>
          <Icon name="account" size={40} color="#fff" />
        </View>
        <Text style={drawerStyles.username}>房东用户</Text>
      </View>

      <View style={drawerStyles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={[drawerStyles.menuItem, isActive(item.route) && drawerStyles.menuItemActive]}
            onPress={() => handleMenuPress(item.route)}
          >
            <Icon name={item.icon} size={24} color={isActive(item.route) ? '#409EFF' : '#606266'} />
            <Text style={[drawerStyles.menuText, isActive(item.route) && drawerStyles.menuTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={drawerStyles.footer}>
        <TouchableOpacity style={drawerStyles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#F56C6C" />
          <Text style={drawerStyles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const drawerStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#409EFF',
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  username: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  menuContainer: { flex: 1, paddingTop: 10 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  menuItemActive: { backgroundColor: '#ecf5ff', borderLeftColor: '#409EFF' },
  menuText: { marginLeft: 15, fontSize: 16, color: '#606266' },
  menuTextActive: { color: '#409EFF', fontWeight: '500' },
  footer: { borderTopWidth: 1, borderTopColor: '#e6e6e6', padding: 15 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  logoutText: { marginLeft: 10, fontSize: 16, color: '#F56C6C' },
});

function HomeTabs({ navigation, route }) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-DRAWER_WIDTH));

  useEffect(() => {
    if (drawerVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [drawerVisible]);

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor="#409EFF" barStyle="light-content" />
      <View style={headerStyles.container}>
        <View style={headerStyles.header}>
          <TouchableOpacity style={headerStyles.menuButton} onPress={openDrawer}>
            <Icon name="menu" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={headerStyles.title}>租房管理系统</Text>
          <View style={headerStyles.placeholder} />
        </View>
      </View>

      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#409EFF',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
        }}
      >
        <Tab.Screen
          name="首页"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="房源"
          component={PropertiesScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="office-building" size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="账单"
          component={BillScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="cash-multiple" size={size} color={color} />,
          }}
        />
      </Tab.Navigator>

      <Modal visible={drawerVisible} transparent animationType="none" onRequestClose={closeDrawer}>
        <View style={modalStyles.container}>
          <TouchableOpacity style={modalStyles.backdrop} activeOpacity={1} onPress={closeDrawer} />
          <Animated.View style={[modalStyles.drawer, { transform: [{ translateX: slideAnim }] }]}>
            <DrawerContent navigation={navigation} currentRoute={route?.name} onClose={closeDrawer} />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: { backgroundColor: '#409EFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: 50,
  },
  menuButton: { padding: 5 },
  title: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 18, fontWeight: 'bold' },
  placeholder: { width: 36 },
});

const modalStyles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#fff',
  },
});

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { isLoggedIn, loading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(loadUser());
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#409EFF" />
      </View>
    );
  }

  const screenOptions = ({ route, navigation }) => {
    const showBack = !['Home', 'Login', 'Register', 'ForgotPassword', 'HomeTab'].includes(route.name);
    const showHeader = showBack;

    if (!showHeader) {
      return { headerShown: false };
    }

    return {
      headerShown: true,
      header: () => (
        <CustomHeader
          title={
            route.name === 'AddProperty' ? '新增房源' :
            route.name === 'EditProperty' ? '编辑房源' :
            route.name === 'AddTenant' ? '新增租客' :
            route.name === 'EditTenant' ? '编辑租客' :
            route.name === 'AddLease' ? '新增租约' :
            route.name === 'EditLease' ? '编辑租约' :
            route.name === 'Properties' ? '房源列表' :
            route.name === 'Tenants' ? '租客列表' :
            route.name === 'Leases' ? '租约列表' :
            route.name === 'Bills' ? '账单列表' :
            route.name === 'Feedbacks' ? '意见反馈' :
            route.name === 'Profile' ? '个人资料' :
            route.name
          }
          navigation={navigation}
          showBack={showBack}
        />
      ),
    };
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={screenOptions}
      >
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Home" component={HomeTabs} />
            <Stack.Screen name="Properties" component={PropertiesScreen} />
            <Stack.Screen name="AddProperty" component={PropertyFormScreen} />
            <Stack.Screen name="EditProperty" component={PropertyFormScreen} />
            <Stack.Screen name="Tenants" component={TenantScreen} />
            <Stack.Screen name="AddTenant" component={TenantFormScreen} />
            <Stack.Screen name="EditTenant" component={TenantFormScreen} />
            <Stack.Screen name="Leases" component={LeaseScreen} />
            <Stack.Screen name="AddLease" component={LeaseFormScreen} />
            <Stack.Screen name="LeaseDetail" component={LeaseDetailScreen} />
            <Stack.Screen name="Bills" component={BillScreen} />
            <Stack.Screen name="Feedbacks" component={FeedbackScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
        </Stack.Navigator>
    </NavigationContainer>
  );
}