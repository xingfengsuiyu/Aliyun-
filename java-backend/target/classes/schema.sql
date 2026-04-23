-- 房东租房管理系统数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS rental_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE rental_management;

-- 房东信息表
CREATE TABLE landlords (
    id VARCHAR(36) PRIMARY KEY,
    account VARCHAR(100) UNIQUE ,
    password VARCHAR(255) ,
    name VARCHAR(255) ,
    phone VARCHAR(20) UNIQUE ,
    email VARCHAR(100) ,
    status VARCHAR(100) ,
    login_fail_count INT DEFAULT 0,
    locked_until DATETIME,
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 房源信息表
CREATE TABLE properties (
    id VARCHAR(36) PRIMARY KEY,
    landlord_id VARCHAR(36) ,
    name VARCHAR(200) ,
    address VARCHAR(500) ,
    property_type VARCHAR(500) ,
    layout VARCHAR(50) ,
    area DECIMAL(10, 2) ,
    decoration VARCHAR(500) ,
    orientation VARCHAR(500),
    total_floors INT ,
    current_floor INT ,
    rent DECIMAL(10, 2) ,
    deposit DECIMAL(10, 2) ,
    deposit_mode VARCHAR(500) ,
    floor VARCHAR(500) ,
    description VARCHAR(500) ,
    available_from DATE ,
    min_lease_term INT ,
    allow_pets BOOLEAN DEFAULT FALSE,
    allow_sublet BOOLEAN DEFAULT FALSE,
    status VARCHAR(500),
    maintenance_reason VARCHAR(500),
    expected_available_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    room_number varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '房间号',
    INDEX idx_landlord_id (landlord_id),
    INDEX idx_status (status),
    INDEX idx_property_type (property_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 房源配套设施表
CREATE TABLE property_facilities (
    property_id VARCHAR(36) ,
    facility VARCHAR(100) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 房源图片表
CREATE TABLE property_images (
    property_id VARCHAR(36) ,
    image_url VARCHAR(500) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 租客信息表
CREATE TABLE tenants (
    id VARCHAR(36) PRIMARY KEY,
    landlord_id VARCHAR(36) ,
    name VARCHAR(100) ,
    gender VARCHAR(100),
    id_card VARCHAR(18) UNIQUE ,
    phone VARCHAR(20) UNIQUE ,
    email VARCHAR(100) UNIQUE,
    emergency_contact_name VARCHAR(100) ,
    emergency_contact_phone VARCHAR(20) ,
    property_id VARCHAR(36),
    status VARCHAR(100),
    notes VARCHAR(500) ,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_landlord_id (landlord_id),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 租客身份证照片表
CREATE TABLE tenant_id_photos (
    tenant_id VARCHAR(36) ,
    photo_url VARCHAR(500) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 租约信息表
CREATE TABLE leases (
    id VARCHAR(36) PRIMARY KEY,
    landlord_id VARCHAR(36) ,
    property_id VARCHAR(36) ,
    tenant_id VARCHAR(36) ,
    start_date DATE ,
    end_date DATE ,
    rent DECIMAL(10, 2) ,
    deposit DECIMAL(10, 2) ,
    payment_mode VARCHAR(50) ,
    payment_method VARCHAR(50) ,
    payment_day INT ,
    include_property_fee BOOLEAN DEFAULT FALSE,
    include_utility BOOLEAN DEFAULT FALSE,
    other_terms TEXT,
    status VARCHAR(50) ,
    special_terms VARCHAR(500),
    termination_reason VARCHAR(500),
    actual_termination_date DATE,
    renewed_from VARCHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_landlord_id (landlord_id),
    INDEX idx_property_id (property_id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 租约附件表
CREATE TABLE lease_attachments (
    lease_id VARCHAR(36) ,
    attachment_url VARCHAR(500) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 账单信息表
CREATE TABLE bills (
    id VARCHAR(36) PRIMARY KEY,
    landlord_id VARCHAR(36) ,
    lease_id VARCHAR(36) ,
    property_id VARCHAR(36) ,
    tenant_id VARCHAR(36) ,
    bill_type VARCHAR(36) ,
    amount DECIMAL(10, 2) ,
    due_date DATE ,
    paid_amount DECIMAL(10, 2),
    paid_date DATE,
    payment_method VARCHAR(500),
    payment_receipt VARCHAR(500),
    status VARCHAR(500),
    overdue_days INT DEFAULT 0,
    overdue_fee DECIMAL(10, 2) DEFAULT 0.00,
    remark VARCHAR(500),
    notes VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_landlord_id (landlord_id),
    INDEX idx_lease_id (lease_id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 消息记录表
CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY,
    landlord_id VARCHAR(36) ,
    tenant_id VARCHAR(36) ,
    sender_id VARCHAR(36) ,
    sender_name VARCHAR(100) ,
    sender VARCHAR(100) ,
    content TEXT,
    message_type VARCHAR(100) ,
    attachment_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    receiver_id VARCHAR(36) ,
    INDEX idx_landlord_id (landlord_id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 系统配置表
CREATE TABLE settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value VARCHAR(255) ,
    description VARCHAR(255) ,
    landlord_id VARCHAR(36)  ,
    overdue_rate DECIMAL(5, 4) DEFAULT 0.0005,
    sms_enabled BOOLEAN DEFAULT FALSE,
    bill_reminder_enabled BOOLEAN DEFAULT TRUE,
    overdue_reminder_enabled BOOLEAN DEFAULT TRUE,
    message_reminder_enabled BOOLEAN DEFAULT TRUE,
    default_payment_method VARCHAR(50),
    lease_template TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 创建意见反馈表
CREATE TABLE feedbacks (
    id VARCHAR(36) PRIMARY KEY,
    landlord_id VARCHAR(36) NOT NULL COMMENT '房东ID',
    feedback_type VARCHAR(20) NOT NULL COMMENT '反馈类型：功能建议/系统bug/体验反馈/其他',
    title VARCHAR(200) NOT NULL COMMENT '反馈标题',
    content TEXT NOT NULL COMMENT '反馈内容',
    status VARCHAR(20) DEFAULT '待回复' COMMENT '状态：待回复/已回复/已关闭',
    reply TEXT COMMENT '回复内容',
    replied_at DATETIME COMMENT '回复时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_landlord_id (landlord_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='意见反馈表';

-- 创建验证码表
CREATE TABLE verification_codes (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(100) NOT NULL COMMENT '邮箱地址',
    code VARCHAR(10) NOT NULL COMMENT '验证码',
    type VARCHAR(20) NOT NULL COMMENT '类型：FORGOT_PASSWORD/REGISTER',
    used BOOLEAN DEFAULT FALSE COMMENT '是否已使用',
    expires_at DATETIME NOT NULL COMMENT '过期时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_email (email),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='验证码表';