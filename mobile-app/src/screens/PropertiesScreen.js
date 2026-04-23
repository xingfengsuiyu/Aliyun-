/**
 * 房源列表页面
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  FAB,
  Chip,
  Portal,
  Checkbox,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { propertyAPI } from '../api';
import { CustomAlert } from '../components/GlobalAlert';

const STATUS_OPTIONS = [
  { label: '全部状态', value: '' },
  { label: '草稿', value: '草稿' },
  { label: '空闲', value: '空闲' },
  { label: '已出租', value: '已出租' },
  { label: '维护中', value: '维护中' },
];

const PROPERTY_TYPE_OPTIONS = [
  { label: '全部类型', value: '' },
  { label: '住宅', value: '住宅' },
  { label: '商铺', value: '商铺' },
  { label: '写字楼', value: '写字楼' },
  { label: '厂房', value: '厂房' },
  { label: '仓库', value: '仓库' },
];

function CustomDropdown({ label, options, selectedValue, onSelect, visible, onDismiss }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.modalOverlay} onPress={onDismiss}>
        <View style={styles.dropdownContainer} onStartShouldSetResponder={() => true}>
          <Text style={styles.dropdownTitle}>{label}</Text>
          {options.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.dropdownItem,
                selectedValue === option.value && styles.dropdownItemSelected
              ]}
              onPress={() => onSelect(option.value)}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  selectedValue === option.value && styles.dropdownItemTextSelected
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

export default function PropertiesScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [properties, setProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const [batchCreateVisible, setBatchCreateVisible] = useState(false);
  const [batchCreateCount, setBatchCreateCount] = useState('5');
  const [batchCreateType, setBatchCreateType] = useState('住宅');
  const [batchCreateRent, setBatchCreateRent] = useState('');
  const [batchCreateNamePrefix, setBatchCreateNamePrefix] = useState('房源');
  const [batchCreateAddress, setBatchCreateAddress] = useState('');
  const [batchCreateFloor, setBatchCreateFloor] = useState('');
  const [batchCreateRoomPrefix, setBatchCreateRoomPrefix] = useState('');
  const [batchCreateArea, setBatchCreateArea] = useState('');
  const [batchCreateFacilities, setBatchCreateFacilities] = useState([]);

  const [batchEditVisible, setBatchEditVisible] = useState(false);
  const [batchEditType, setBatchEditType] = useState('');
  const [batchEditStatus, setBatchEditStatus] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchProperties();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = {
        page: 0,
        size: 50,
      };
      if (searchQuery.trim()) {
        params.name = searchQuery.trim();
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (propertyTypeFilter) {
        params.propertyType = propertyTypeFilter;
      }
      const res = await propertyAPI.getList(params);
      if (res?.code === 200) {
        setProperties(res.data?.list || []);
      }
    } catch (error) {
      console.error('获取房源列表失败:', error);
      CustomAlert.alert('提示', '获取房源列表失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, [statusFilter, propertyTypeFilter])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  const handleSearch = async () => {
    fetchProperties();
  };

  const getStatusColor = (status) => {
    const colorMap = {
      '空闲': '#67C23A',
      '已出租': '#409EFF',
      '维护中': '#E6A23C',
      '草稿': '#909399',
    };
    return colorMap[status] || '#909399';
  };

  const toggleItemSelection = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleCardPress = (item) => {
    if (editMode) {
      toggleItemSelection(item.id);
    } else {
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate('EditProperty', { id: item.id, property: item });
      } else {
        navigation.navigate('EditProperty', { id: item.id, property: item });
      }
    }
  };

  const handleBatchCreate = async () => {
    const count = parseInt(batchCreateCount) || 5;
    const rent = parseFloat(batchCreateRent) || 0;
    const baseRoomNum = parseInt(batchCreateRoomPrefix) || 1;
    const area = parseFloat(batchCreateArea) || 0;
    const properties = [];
    for (let i = 0; i < count; i++) {
      const roomNum = baseRoomNum + i;
      properties.push({
        name: `${batchCreateNamePrefix}${roomNum}`,
        propertyType: batchCreateType,
        address: batchCreateAddress,
        floor: batchCreateFloor,
        roomNumber: String(roomNum),
        area: area,
        facilities: batchCreateFacilities,
        rent: rent,
        status: '空闲'
      });
    }
    try {
      const res = await propertyAPI.batchCreate(properties);
      if (res?.code === 200) {
        CustomAlert.alert('成功', '批量创建成功');
        setBatchCreateVisible(false);
        resetBatchCreateForm();
        fetchProperties();
      } else {
        CustomAlert.alert('失败', res?.message || '操作失败');
      }
    } catch (error) {
      console.error('批量创建失败:', error);
      CustomAlert.alert('失败', '批量创建失败');
    }
  };

  const resetBatchCreateForm = () => {
    setBatchCreateCount('5');
    setBatchCreateType('住宅');
    setBatchCreateRent('');
    setBatchCreateNamePrefix('房源');
    setBatchCreateAddress('');
    setBatchCreateFloor('');
    setBatchCreateRoomPrefix('');
    setBatchCreateArea('');
    setBatchCreateFacilities([]);
  };

  const toggleFacility = (facility) => {
    setBatchCreateFacilities(prev => {
      if (prev.includes(facility)) {
        return prev.filter(f => f !== facility);
      } else {
        return [...prev, facility];
      }
    });
  };

  const handleBatchEdit = () => {
    if (selectedItems.length === 0) {
      CustomAlert.alert('提示', '请先选择要编辑的房源');
      return;
    }
    setBatchEditVisible(true);
  };

  const handleConfirmBatchEdit = async () => {
    if (!batchEditType && !batchEditStatus) {
      CustomAlert.alert('提示', '请至少选择一项要修改的内容');
      return;
    }
    const updates = selectedItems.map(id => {
      const update = { id };
      if (batchEditType) {
        update.propertyType = batchEditType;
      }
      if (batchEditStatus) {
        update.status = batchEditStatus;
      }
      return update;
    });
    try {
      const res = await propertyAPI.batchUpdate(updates);
      if (res?.code === 200) {
        CustomAlert.alert('成功', '批量更新成功');
        setBatchEditVisible(false);
        setSelectedItems([]);
        setEditMode(false);
        fetchProperties();
      } else {
        CustomAlert.alert('失败', res?.message || '操作失败');
      }
    } catch (error) {
      console.error('批量更新失败:', error);
      CustomAlert.alert('失败', '批量更新失败');
    }
  };

  const handleDeleteProperty = async (item) => {
    CustomAlert.alert(
      '提示',
      `确定要删除 ${item.name} 吗？`,
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: async () => {
          try {
            const res = await propertyAPI.delete(item.id);
            if (res?.code === 200) {
              fetchProperties();
            } else {
              CustomAlert.alert('失败', res?.message || '删除失败');
            }
          } catch (error) {
            console.error('删除失败:', error);
            CustomAlert.alert('失败', '删除失败');
          }
        }}
      ]
    );
  };

  const renderItem = ({ item }) => (
    <Card style={[styles.card, editMode && selectedItems.includes(item.id) && styles.cardSelected]}>
      <Pressable onPress={() => handleCardPress(item)}>
        <Card.Content>
          <View style={styles.cardHeader}>
            {editMode && (
              <Checkbox
                status={selectedItems.includes(item.id) ? 'checked' : 'unchecked'}
                onPress={() => toggleItemSelection(item.id)}
                color="#409EFF"
              />
            )}
            <Title style={[styles.cardTitle, editMode && styles.cardTitleWithCheckbox]}>{item.name}</Title>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
              textStyle={styles.statusText}
            >
              {item.status}
            </Chip>
          </View>
          <Text style={styles.address}>{item.address}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>类型: {item.propertyType}</Text>
            <Text style={styles.infoText}>面积: {item.area}㎡</Text>
          </View>
          <Text style={styles.rent}>¥{item.rent}/月</Text>
        </Card.Content>
      </Pressable>
      {!editMode && (
        <Card.Actions>
          <Pressable onPress={() => handleDeleteProperty(item)}>
            <Text style={styles.deleteBtn}>删除</Text>
          </Pressable>
        </Card.Actions>
      )}
    </Card>
  );

  const currentStatusLabel = STATUS_OPTIONS.find(opt => opt.value === statusFilter)?.label || '全部状态';
  const currentTypeLabel = PROPERTY_TYPE_OPTIONS.find(opt => opt.value === propertyTypeFilter)?.label || '全部类型';

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Pressable style={styles.toolbarBtn} onPress={() => setBatchCreateVisible(true)}>
          <Text style={styles.toolbarBtnText}>批量新增</Text>
        </Pressable>
        <Pressable style={[styles.toolbarBtn, editMode && styles.toolbarBtnActive]} onPress={() => {
          if (editMode) {
            setEditMode(false);
            setSelectedItems([]);
          } else {
            setEditMode(true);
          }
        }}>
          <Text style={[styles.toolbarBtnText, editMode && styles.toolbarBtnTextActive]}>
            {editMode ? '取消选择' : '选择'}
          </Text>
        </Pressable>
        {editMode && selectedItems.length > 0 && (
          <Pressable style={styles.toolbarBtn} onPress={handleBatchEdit}>
            <Text style={styles.toolbarBtnText}>批量编辑({selectedItems.length})</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.searchbar}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索房源名称"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            icon="chevron-down"
            onPress={() => setStatusMenuVisible(true)}
            style={styles.filterChip}
          >
            {currentStatusLabel}
          </Chip>

          <Chip
            icon="chevron-down"
            onPress={() => setTypeMenuVisible(true)}
            style={styles.filterChip}
          >
            {currentTypeLabel}
          </Chip>

          {(statusFilter || propertyTypeFilter) && (
            <Pressable
              onPress={() => {
                setStatusFilter('');
                setPropertyTypeFilter('');
              }}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>清除筛选</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>

      <CustomDropdown
        label="选择状态"
        options={STATUS_OPTIONS}
        selectedValue={statusFilter}
        onSelect={(value) => {
          setStatusFilter(value);
          setStatusMenuVisible(false);
        }}
        visible={statusMenuVisible}
        onDismiss={() => setStatusMenuVisible(false)}
      />

      <CustomDropdown
        label="选择类型"
        options={PROPERTY_TYPE_OPTIONS}
        selectedValue={propertyTypeFilter}
        onSelect={(value) => {
          setPropertyTypeFilter(value);
          setTypeMenuVisible(false);
        }}
        visible={typeMenuVisible}
        onDismiss={() => setTypeMenuVisible(false)}
      />

      <FlatList
        data={properties}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无房源，点击下方按钮添加</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddProperty')}
      />

      <Portal>
        <Modal visible={batchCreateVisible} transparent animationType="fade" onRequestClose={() => setBatchCreateVisible(false)}>
          <Pressable style={styles.modalOverlay} onPress={(evt) => {
            if (evt.target === evt.currentTarget) {
              setBatchCreateVisible(false);
            }
          }}>
            <View style={[styles.dialogBox, styles.dialogBoxLarge]} onStartShouldSetResponder={() => true} onTouchStart={(e) => e.stopPropagation()} onTouchEnd={(e) => e.stopPropagation()}>
              <Text style={styles.dialogTitle}>批量新增房源</Text>
              <ScrollView style={styles.dialogScrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.dialogContent}>
                  <Text style={styles.dialogLabel}>新增数量</Text>
                  <TextInput
                    style={styles.dialogInput}
                    value={batchCreateCount}
                    onChangeText={setBatchCreateCount}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.dialogContent}>
                  <Text style={styles.dialogLabel}>房源名称</Text>
                  <TextInput
                    style={styles.dialogInput}
                    value={batchCreateNamePrefix}
                    onChangeText={setBatchCreateNamePrefix}
                    placeholder="如: 房源"
                  />
                  <Text style={styles.dialogHint}>将生成: 房源101, 房源102, ...</Text>
                </View>
                <View style={styles.dialogContent}>
                  <Text style={styles.dialogLabel}>房源类型</Text>
                  <View style={styles.dialogSelect}>
                    {PROPERTY_TYPE_OPTIONS.slice(1).map((opt) => (
                      <Pressable
                        key={opt.value}
                        style={[styles.selectOption, batchCreateType === opt.value && styles.selectOptionActive]}
                        onPress={() => setBatchCreateType(opt.value)}
                      >
                        <Text style={[styles.selectOptionText, batchCreateType === opt.value && styles.selectOptionTextActive]}>
                          {opt.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <View style={styles.dialogContent}>
                  <Text style={styles.dialogLabel}>详细地址</Text>
                  <TextInput
                    style={styles.dialogInput}
                    value={batchCreateAddress}
                    onChangeText={setBatchCreateAddress}
                    placeholder="请输入详细地址"
                  />
                </View>
                <View style={styles.dialogContent}>
                  <Text style={styles.dialogLabel}>楼层</Text>
                  <TextInput
                    style={styles.dialogInput}
                    value={batchCreateFloor}
                    onChangeText={setBatchCreateFloor}
                    placeholder="如: 1层"
                  />
                </View>
                <View style={styles.dialogContent}>
                  <Text style={styles.dialogLabel}>房间号前缀</Text>
                  <TextInput
                    style={styles.dialogInput}
                    value={batchCreateRoomPrefix}
                    onChangeText={setBatchCreateRoomPrefix}
                    placeholder="如: 101"
                  />
                  <Text style={styles.dialogHint}>将自动加1生成: 101, 102, 103...</Text>
                </View>
                <View style={styles.dialogContent}>
                  <Text style={styles.dialogLabel}>面积(㎡)</Text>
                  <TextInput
                    style={styles.dialogInput}
                    value={batchCreateArea}
                    onChangeText={setBatchCreateArea}
                    placeholder="面积"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.dialogContent}>
                  <Text style={styles.dialogLabel}>配套设施</Text>
                  <View style={styles.dialogSelect}>
                    {['空调', '热水器', '冰箱', '洗衣机', '床', '沙发', '衣柜', '电视', '宽带', '暖气'].map((facility) => (
                      <Pressable
                        key={facility}
                        style={[styles.selectOption, batchCreateFacilities.includes(facility) && styles.selectOptionActive]}
                        onPress={() => toggleFacility(facility)}
                      >
                        <Text style={[styles.selectOptionText, batchCreateFacilities.includes(facility) && styles.selectOptionTextActive]}>
                          {facility}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <View style={styles.dialogContent}>
                  <Text style={styles.dialogLabel}>默认租金(元/月)</Text>
                  <TextInput
                    style={styles.dialogInput}
                    value={batchCreateRent}
                    onChangeText={setBatchCreateRent}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
              </ScrollView>
              <View style={styles.dialogButtons}>
                <Pressable style={styles.dialogCancelBtn} onPress={() => {
                  setBatchCreateVisible(false);
                  resetBatchCreateForm();
                }}>
                  <Text style={styles.dialogCancelText}>取消</Text>
                </Pressable>
                <Pressable style={styles.dialogConfirmBtn} onPress={handleBatchCreate}>
                  <Text style={styles.dialogConfirmText}>确定</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Modal>

        <Modal visible={batchEditVisible} transparent animationType="fade" onRequestClose={() => setBatchEditVisible(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setBatchEditVisible(false)}>
            <View style={styles.dialogBox} onStartShouldSetResponder={() => true} onTouchStart={(e) => e.stopPropagation()}>
              <Text style={styles.dialogTitle}>批量编辑</Text>
              <Text style={styles.dialogSubTitle}>已选中 {selectedItems.length} 条记录</Text>
              <View style={styles.dialogContent}>
                <Text style={styles.dialogLabel}>类型</Text>
                <View style={styles.dialogSelect}>
                  <Pressable
                    style={[styles.selectOption, !batchEditType && styles.selectOptionActive]}
                    onPress={() => setBatchEditType('')}
                  >
                    <Text style={[styles.selectOptionText, !batchEditType && styles.selectOptionTextActive]}>不修改</Text>
                  </Pressable>
                  {PROPERTY_TYPE_OPTIONS.slice(1).map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={[styles.selectOption, batchEditType === opt.value && styles.selectOptionActive]}
                      onPress={() => setBatchEditType(opt.value)}
                    >
                      <Text style={[styles.selectOptionText, batchEditType === opt.value && styles.selectOptionTextActive]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.dialogContent}>
                <Text style={styles.dialogLabel}>状态</Text>
                <View style={styles.dialogSelect}>
                  <Pressable
                    style={[styles.selectOption, !batchEditStatus && styles.selectOptionActive]}
                    onPress={() => setBatchEditStatus('')}
                  >
                    <Text style={[styles.selectOptionText, !batchEditStatus && styles.selectOptionTextActive]}>不修改</Text>
                  </Pressable>
                  {STATUS_OPTIONS.slice(1).map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={[styles.selectOption, batchEditStatus === opt.value && styles.selectOptionActive]}
                      onPress={() => setBatchEditStatus(opt.value)}
                    >
                      <Text style={[styles.selectOptionText, batchEditStatus === opt.value && styles.selectOptionTextActive]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.dialogButtons}>
                <Pressable style={styles.dialogCancelBtn} onPress={() => setBatchEditVisible(false)}>
                  <Text style={styles.dialogCancelText}>取消</Text>
                </Pressable>
                <Pressable style={styles.dialogConfirmBtn} onPress={handleConfirmBatchEdit}>
                  <Text style={styles.dialogConfirmText}>确定</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  toolbar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  toolbarBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#409EFF',
    borderRadius: 4,
    marginRight: 10,
  },
  toolbarBtnActive: {
    backgroundColor: '#909399',
  },
  toolbarBtnText: {
    color: '#fff',
    fontSize: 12,
  },
  toolbarBtnTextActive: {
    color: '#fff',
  },
  searchbar: {
    padding: 10,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  filterChip: {
    marginRight: 10,
  },
  clearButton: {
    alignSelf: 'center',
    paddingHorizontal: 10,
  },
  clearButtonText: {
    color: '#409EFF',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#409EFF',
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
  cardTitleWithCheckbox: {
    marginLeft: 8,
  },
  statusChip: {
    height: 26,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
  address: {
    color: '#666',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  infoText: {
    color: '#999',
    marginRight: 15,
    fontSize: 13,
  },
  rent: {
    color: '#F56C6C',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  deleteBtn: {
    color: '#F56C6C',
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 15,
    bottom: 15,
    backgroundColor: '#409EFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 150,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 10,
    minWidth: 200,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  dropdownItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#666',
  },
  dropdownItemTextSelected: {
    color: '#409EFF',
    fontWeight: 'bold',
  },
  dialogBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '85%',
    maxHeight: '80%',
  },
  dialogBoxLarge: {
    maxHeight: '90%',
  },
  dialogScrollView: {
    maxHeight: 400,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  dialogSubTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  dialogContent: {
    marginBottom: 15,
  },
  dialogLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dialogInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 10,
  },
  dialogHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  dialogSelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  selectOptionActive: {
    backgroundColor: '#409EFF',
    borderColor: '#409EFF',
  },
  selectOptionText: {
    fontSize: 13,
    color: '#666',
  },
  selectOptionTextActive: {
    color: '#fff',
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  dialogCancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
  },
  dialogCancelText: {
    color: '#666',
    fontSize: 15,
  },
  dialogConfirmBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#409EFF',
    borderRadius: 4,
  },
  dialogConfirmText: {
    color: '#fff',
    fontSize: 15,
  },
});