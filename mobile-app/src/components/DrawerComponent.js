/**
 * 侧边抽屉组件
 * 可收缩的侧边菜单，提供快速导航入口
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import { logout } from '../store/userSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

const menuItems = [
  { name: '首页', route: 'HomeTab', icon: 'home' },
  { name: '房源管理', route: 'Properties', icon: 'office-building' },
  { name: '租客管理', route: 'Tenants', icon: 'account-multiple' },
  { name: '租约管理', route: 'Leases', icon: 'file-document' },
  { name: '账单管理', route: 'Bills', icon: 'cash-multiple' },
  { name: '意见反馈', route: 'Feedback', icon: 'message-reply' },
];

export default function DrawerComponent({ visible, onClose, navigation, currentRoute }) {
  const dispatch = useDispatch();
  const [slideAnim] = useState(new Animated.Value(-DRAWER_WIDTH));

  React.useEffect(() => {
    if (visible) {
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
  }, [visible]);

  const handleMenuPress = (route) => {
    onClose();
    if (route === 'HomeTab') {
      navigation.navigate('Home');
    } else {
      navigation.navigate(route);
    }
  };

  const handleLogout = () => {
    onClose();
    dispatch(logout());
  };

  const isActive = (route) => {
    if (route === 'HomeTab') {
      return currentRoute === 'Home';
    }
    return currentRoute === route;
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
          {/* 头部 */}
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Icon name="account" size={40} color="#fff" />
            </View>
            <Text style={styles.username}>房东用户</Text>
          </View>

          {/* 菜单列表 */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.menuItem,
                  isActive(item.route) && styles.menuItemActive,
                ]}
                onPress={() => handleMenuPress(item.route)}
              >
                <Icon
                  name={item.icon}
                  size={24}
                  color={isActive(item.route) ? '#409EFF' : '#606266'}
                />
                <Text
                  style={[
                    styles.menuText,
                    isActive(item.route) && styles.menuTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 底部退出按钮 */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Icon name="logout" size={24} color="#F56C6C" />
              <Text style={styles.logoutText}>退出登录</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#409EFF',
    padding: 30,
    paddingTop: 50,
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
  username: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  menuItemActive: {
    backgroundColor: '#ecf5ff',
    borderLeftColor: '#409EFF',
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#606266',
  },
  menuTextActive: {
    color: '#409EFF',
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e6e6e6',
    padding: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#F56C6C',
  },
});