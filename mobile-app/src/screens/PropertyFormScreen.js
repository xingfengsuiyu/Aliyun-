/**
 * 房源表单页面
 * 新增/编辑房源
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
  SegmentedButtons,
} from 'react-native-paper';
import { propertyAPI } from '../api';

const PROPERTY_TYPES = [
  { value: '住宅', label: '住宅' },
  { value: '商铺', label: '商铺' },
  { value: '写字楼', label: '写字楼' },
  { value: '厂房', label: '厂房' },
  { value: '仓库', label: '仓库' },
];

const FACILITIES = ['空调', '冰箱', '洗衣机', '热水器', '床', '衣柜', '宽带', '停车位'];

export default function PropertyFormScreen({ navigation, route }) {
  const propertyId = route.params?.id;
  const propertyData = route.params?.property;
  const isEdit = !!propertyId;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [floor, setFloor] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isEdit && propertyData) {
      setName(propertyData.name || '');
      setPropertyType(propertyData.propertyType || '');
      setAddress(propertyData.address || '');
      setArea(propertyData.area ? String(propertyData.area) : '');
      setRent(propertyData.rent ? String(propertyData.rent) : '');
      setDeposit(propertyData.deposit ? String(propertyData.deposit) : '');
      setFloor(propertyData.floor || '');
      setFacilities(propertyData.facilities || []);
      setDescription(propertyData.description || '');
    } else if (isEdit) {
      loadProperty();
    }
  }, []);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const res = await propertyAPI.getById(propertyId);
      if (res?.code === 200) {
        const data = res.data;
        setName(data.name || '');
        setPropertyType(data.propertyType || '');
        setAddress(data.address || '');
        setArea(data.area ? String(data.area) : '');
        setRent(data.rent ? String(data.rent) : '');
        setDeposit(data.deposit ? String(data.deposit) : '');
        setFloor(data.floor || '');
        setFacilities(data.facilities || []);
        setDescription(data.description || '');
      }
    } catch (error) {
      console.error('加载房源失败:', error);
      Alert.alert('提示', '加载房源信息失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleFacility = (facility) => {
    setFacilities(prev =>
      prev.includes(facility)
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入房源名称');
      return;
    }
    if (!propertyType) {
      Alert.alert('提示', '请选择房源类型');
      return;
    }
    if (!address.trim()) {
      Alert.alert('提示', '请输入详细地址');
      return;
    }
    if (!area || parseFloat(area) <= 0) {
      Alert.alert('提示', '请输入面积');
      return;
    }
    if (!rent || parseFloat(rent) <= 0) {
      Alert.alert('提示', '请输入租金');
      return;
    }

    const data = {
      name: name.trim(),
      propertyType,
      address: address.trim(),
      area: parseFloat(area),
      rent: parseFloat(rent),
      deposit: deposit ? parseFloat(deposit) : 0,
      floor: floor ? String(floor) : null,
      facilities,
      description: description.trim(),
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        await propertyAPI.update({ id: propertyId, property: data });
        Alert.alert('成功', '更新成功');
      } else {
        await propertyAPI.create(data);
        Alert.alert('成功', '创建成功');
      }
      navigation.goBack();
    } catch (error) {
      console.error('提交失败:', error);
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
          <Title style={styles.title}>{isEdit ? '编辑房源' : '新增房源'}</Title>

          <TextInput
            label="房源名称"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            placeholder="请输入房源名称"
          />

          <Text style={styles.label}>房源类型</Text>
          <View style={styles.typeContainer}>
            {PROPERTY_TYPES.map((type) => (
              <Button
                key={type.value}
                mode={propertyType === type.value ? 'contained' : 'outlined'}
                onPress={() => setPropertyType(type.value)}
                style={styles.typeButton}
                compact
              >
                {type.label}
              </Button>
            ))}
          </View>

          <TextInput
            label="详细地址"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            style={styles.input}
            placeholder="请输入详细地址"
          />

          <View style={styles.row}>
            <TextInput
              label="面积(㎡)"
              value={area}
              onChangeText={setArea}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
              placeholder="面积"
            />
            <TextInput
              label="租金(元/月)"
              value={rent}
              onChangeText={setRent}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
              placeholder="租金"
            />
          </View>

          <View style={styles.row}>
            <TextInput
              label="押金(元)"
              value={deposit}
              onChangeText={setDeposit}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
              placeholder="押金"
            />
            <TextInput
              label="楼层"
              value={floor}
              onChangeText={setFloor}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              placeholder="如: 5/18"
            />
          </View>

          <Text style={styles.label}>配套设施</Text>
          <View style={styles.facilityContainer}>
            {FACILITIES.map((facility) => (
              <Button
                key={facility}
                mode={facilities.includes(facility) ? 'contained' : 'outlined'}
                onPress={() => toggleFacility(facility)}
                style={styles.facilityButton}
                compact
              >
                {facility}
              </Button>
            ))}
          </View>

          <TextInput
            label="房源描述"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={4}
            placeholder="请输入房源描述"
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
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  typeButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  facilityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  facilityButton: {
    marginRight: 8,
    marginBottom: 8,
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