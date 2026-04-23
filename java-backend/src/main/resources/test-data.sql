-- ========================================
-- 测试数据脚本 - 房东租房管理系统
-- ========================================

-- 使用数据库
USE rental_management;

-- 1. 插入测试房东账号
-- 密码: admin123 (BCrypt加密)
INSERT INTO landlords (id, account, password, name, phone, email, status, login_fail_count, locked_until) 
VALUES 
('landlord-001', 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '张三房东', '13800138000', 'admin@rental.com', '正常', 0, NULL),
('landlord-002', 'test', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '测试房东', '13900139000', 'test@rental.com', '正常', 0, NULL);

-- 2. 插入测试房源
INSERT INTO properties (id, landlord_id, name, property_type, status, address, area, rent, deposit, floor, description, created_at, updated_at)
VALUES
('prop-001', 'landlord-001', '阳光花园小区 3号楼 501', '住宅', '空闲', '北京市朝阳区阳光花园小区3号楼501室', 89.5, 4500.00, 9000.00, '5/18', '南北通透，精装修，拎包入住', NOW(), NOW()),
('prop-002', 'landlord-001', '万达广场写字楼 A座 1203', '写字楼', '已出租', '北京市朝阳区万达广场A座1203室', 120.0, 8000.00, 16000.00, '12/25', '交通便利，配套齐全', NOW(), NOW()),
('prop-003', 'landlord-001', '科技园商铺 1层 108号', '商铺', '空闲', '北京市海淀区科技园路108号', 65.0, 6000.00, 12000.00, '1/3', '临街商铺，人流量大', NOW(), NOW()),
('prop-004', 'landlord-001', '工业区厂房 A栋', '厂房', '草稿', '北京市大兴区工业区A栋', 500.0, 15000.00, 30000.00, '1/1', '宽敞明亮，适合生产', NOW(), NOW()),
('prop-005', 'landlord-002', '海景公寓 8号楼 1202', '住宅', '已出租', '上海市浦东新区海景公寓8号楼1202室', 95.0, 5500.00, 11000.00, '12/20', '海景房，视野开阔', NOW(), NOW());

-- 3. 插入房源配套设施
INSERT INTO property_facilities (property_id, facility)
VALUES
('prop-001', '空调'), ('prop-001', '冰箱'), ('prop-001', '洗衣机'), ('prop-001', '热水器'), 
('prop-001', '床'), ('prop-001', '衣柜'), ('prop-001', '宽带'),

('prop-002', '空调'), ('prop-002', '宽带'), ('prop-002', '停车位'),

('prop-003', '空调'), ('prop-003', '热水器'),

('prop-005', '空调'), ('prop-005', '冰箱'), ('prop-005', '洗衣机'), ('prop-005', '热水器'),
('prop-005', '床'), ('prop-005', '衣柜'), ('prop-005', '宽带'), ('prop-005', '停车位');

-- 4. 插入房源图片（示例URL）
INSERT INTO property_images (property_id, image_url)
VALUES
('prop-001', 'https://example.com/images/prop001_1.jpg'),
('prop-001', 'https://example.com/images/prop001_2.jpg'),
('prop-001', 'https://example.com/images/prop001_3.jpg'),

('prop-002', 'https://example.com/images/prop002_1.jpg'),
('prop-002', 'https://example.com/images/prop002_2.jpg'),

('prop-005', 'https://example.com/images/prop005_1.jpg'),
('prop-005', 'https://example.com/images/prop005_2.jpg'),
('prop-005', 'https://example.com/images/prop005_3.jpg');

-- 5. 插入测试租客
INSERT INTO tenants (id, name, gender, phone, id_card, emergency_contact_name, emergency_contact_phone, status, notes, created_at, updated_at)
VALUES
('tenant-001', '李明', '男', '13600136000', '110101199001011234', '李华', '13700137000', '正常', 'IT工程师，爱干净', NOW(), NOW()),
('tenant-002', '王芳', '女', '13500135000', '110101199202021234', '王强', '13400134000', '正常', '教师，稳定职业', NOW(), NOW()),
('tenant-003', '张伟', '男', '13300133000', '110101198803031234', '张丽', '13200132000', '已退租', '之前租住过', NOW(), NOW());

-- 6. 插入租约
INSERT INTO leases (id, property_id, tenant_id, landlord_id, start_date, end_date, rent, deposit, payment_method, status, special_terms, created_at, updated_at)
VALUES
('lease-001', 'prop-002', 'tenant-001', 'landlord-001', '2024-01-01', '2024-12-31', 8000.00, 16000.00, '押一付三', '生效中', '不得转租', NOW(), NOW()),
('lease-002', 'prop-005', 'tenant-002', 'landlord-002', '2024-03-01', '2025-02-28', 5500.00, 11000.00, '押一付一', '生效中', '可养宠物', NOW(), NOW()),
('lease-003', 'prop-001', 'tenant-003', 'landlord-001', '2023-06-01', '2024-05-31', 4000.00, 8000.00, '年付', '已终止', '已提前退租', NOW(), NOW());

-- 7. 插入账单
INSERT INTO bills (id, landlord_id, lease_id, bill_type, amount, overdue_fee, due_date, paid_date, payment_method, status, notes, created_at, updated_at)
VALUES
-- 已支付账单
('bill-001', 'landlord-001', 'lease-001', '租金', 8000.00, 0.00, '2024-01-15', '2024-01-10', '银行转账', '已支付', '1月租金', NOW(), NOW()),
('bill-002', 'landlord-001', 'lease-001', '租金', 8000.00, 0.00, '2024-02-15', '2024-02-12', '银行转账', '已支付', '2月租金', NOW(), NOW()),
('bill-003', 'landlord-002', 'lease-002', '租金', 5500.00, 0.00, '2024-03-05', '2024-03-01', '微信支付', '已支付', '3月租金', NOW(), NOW()),

-- 待支付账单
('bill-004', 'landlord-001', 'lease-001', '租金', 8000.00, 0.00, '2026-05-15', NULL, NULL, '待支付', '5月租金', NOW(), NOW()),
('bill-005', 'landlord-002', 'lease-002', '租金', 5500.00, 0.00, '2026-05-05', NULL, NULL, '待支付', '5月租金', NOW(), NOW()),
('bill-006', 'landlord-001', 'lease-001', '水电费', 350.00, 0.00, '2026-05-20', NULL, NULL, '待支付', '4月水电费', NOW(), NOW()),

-- 逾期账单
('bill-007', 'landlord-001', 'lease-001', '租金', 8000.00, 200.00, '2026-04-15', NULL, NULL, '逾期', '4月租金-已逾期', NOW(), NOW());

-- 8. 插入消息
INSERT INTO messages (id, landlord_id, tenant_id, sender_id, sender_name, receiver_id, content, message_type, is_read, created_at)
VALUES
('msg-001', 'landlord-001', 'tenant-001', 'landlord-001', '张三房东', 'tenant-001', '你好，5月份的租金请按时缴纳。', '文字', TRUE, NOW() - INTERVAL 5 DAY),
('msg-002', 'landlord-001', 'tenant-001', 'tenant-001', '李明', 'landlord-001', '好的，我会在15号之前转账。', '文字', TRUE, NOW() - INTERVAL 4 DAY),
('msg-003', 'landlord-001', 'tenant-001', 'landlord-001', '张三房东', 'tenant-001', '空调如果有什么问题随时联系我。', '文字', FALSE, NOW() - INTERVAL 1 DAY),
('msg-004', 'landlord-002', 'tenant-002', 'tenant-002', '王芳', 'landlord-002', '房东你好，我想续租一年。', '文字', FALSE, NOW() - INTERVAL 2 DAY);

-- 9. 插入系统设置
INSERT INTO settings (setting_key, setting_value, description, created_at, updated_at)
VALUES
('overdue_rate', '0.0005', '逾期费率（每日）', NOW(), NOW()),
('bill_advance_days', '7', '提前生成账单天数', NOW(), NOW()),
('lease_expire_remind_days', '30', '租约到期提醒天数', NOW(), NOW()),
('max_login_attempts', '5', '最大登录尝试次数', NOW(), NOW()),
('lock_duration_hours', '1', '账号锁定时长（小时）', NOW(), NOW());

-- ========================================
-- 查询验证
-- ========================================

SELECT '===== 房东账号 =====' AS '';
SELECT id, account, name, phone, status FROM landlords;

SELECT '===== 房源列表 =====' AS '';
SELECT id, name, property_type, status, rent FROM properties;

SELECT '===== 租客列表 =====' AS '';
SELECT id, name, phone, status FROM tenants;

SELECT '===== 租约列表 =====' AS '';
SELECT id, start_date, end_date, status FROM leases;

SELECT '===== 账单统计 =====' AS '';
SELECT status, COUNT(*) as count, SUM(amount) as total FROM bills GROUP BY status;

SELECT '===== 消息列表 =====' AS '';
SELECT id, sender_name, content, is_read FROM messages;

SELECT '===== 系统设置 =====' AS '';
SELECT setting_key, setting_value, description FROM settings;

-- ========================================
-- 完成提示
-- ========================================
SELECT '✅ 测试数据插入完成！' AS message;
SELECT '可以使用以下账号登录：' AS '';
SELECT '账号: admin 或 test' AS '';
SELECT '密码: admin123' AS '';
