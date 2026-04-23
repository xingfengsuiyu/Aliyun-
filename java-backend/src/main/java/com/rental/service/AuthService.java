package com.rental.service;

import com.rental.dto.LoginRequest;
import com.rental.dto.ProfileUpdateRequest;
import com.rental.dto.RegisterRequest;
import com.rental.entity.Landlord;
import com.rental.mapper.LandlordMapper;
import com.rental.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Pattern ACCOUNT_PATTERN = Pattern.compile("^[a-zA-Z0-9_]{3,32}$");

    private final LandlordMapper landlordMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public Map<String, Object> register(RegisterRequest request) {
        if (request == null || !StringUtils.hasText(request.getAccount())) {
            throw new RuntimeException("请输入账号");
        }
        if (!StringUtils.hasText(request.getPassword())) {
            throw new RuntimeException("请输入密码");
        }
        if (request.getPassword().length() < 6) {
            throw new RuntimeException("密码长度至少6位");
        }
        if (!StringUtils.hasText(request.getConfirmPassword())
                || !request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("两次输入的密码不一致");
        }
        if (!StringUtils.hasText(request.getEmail())) {
            throw new RuntimeException("请输入邮箱");
        }

        String account = request.getAccount().trim();
        if (!ACCOUNT_PATTERN.matcher(account).matches()) {
            throw new RuntimeException("账号为3-32位字母、数字或下划线");
        }

        String email = request.getEmail().trim();
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new RuntimeException("邮箱格式不正确");
        }

        if (landlordMapper.findByAccount(account) != null) {
            throw new RuntimeException("账号已存在");
        }

        String phone = StringUtils.hasText(request.getPhone()) ? request.getPhone().trim() : null;

        if (phone != null && landlordMapper.findByPhone(phone) != null) {
            throw new RuntimeException("手机号已被注册");
        }
        if (landlordMapper.findByEmail(email) != null) {
            throw new RuntimeException("邮箱已被注册");
        }

        Landlord landlord = Landlord.builder()
                .id(UUID.randomUUID().toString())
                .account(account)
                .password(passwordEncoder.encode(request.getPassword()))
                .name(account)
                .phone(phone)
                .email(email)
                .status("正常")
                .failedLoginAttempts(0)
                .build();

        landlordMapper.insert(landlord);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setAccount(account);
        loginRequest.setPassword(request.getPassword());
        return login(loginRequest);
    }

    public Map<String, Object> login(LoginRequest request) {
        Landlord landlord = landlordMapper.findByAccount(request.getAccount());
        if (landlord == null) {
            throw new RuntimeException("账号不存在");
        }
        
        // Check if account is locked
        if (landlord.getLockedUntil() != null && LocalDateTime.now().isBefore(landlord.getLockedUntil())) {
            long minutes = java.time.Duration.between(LocalDateTime.now(), landlord.getLockedUntil()).toMinutes();
            throw new RuntimeException("账号已被锁定，请 " + (minutes + 1) + " 分钟后重试");
        }
        
        // Validate password
        if (!passwordEncoder.matches(request.getPassword(), landlord.getPassword())) {
            landlord.setFailedLoginAttempts(landlord.getFailedLoginAttempts() + 1);
            
            if (landlord.getFailedLoginAttempts() >= 5) {
                landlord.setLockedUntil(LocalDateTime.now().plusHours(1));
            }
            
            landlordMapper.update(landlord);
            throw new RuntimeException("密码错误");
        }
        
        // Reset failed attempts
        landlord.setFailedLoginAttempts(0);
        landlord.setLockedUntil(null);
        landlord.setLastLoginAt(LocalDateTime.now());
        landlordMapper.update(landlord);
        
        // Generate token
        String token = jwtTokenProvider.generateToken(landlord.getId(), landlord.getAccount());
        
        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        
        Map<String, Object> user = new HashMap<>();
        user.put("id", landlord.getId());
        user.put("account", landlord.getAccount());
        user.put("phone", maskPhone(landlord.getPhone()));
        user.put("email", landlord.getEmail());
        response.put("user", user);
        
        return response;
    }
    
    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) return phone;
        return phone.substring(0, 3) + "****" + phone.substring(7);
    }

    public Map<String, Object> getProfile(String landlordId) {
        Landlord landlord = landlordMapper.findById(landlordId);
        if (landlord == null) {
            throw new RuntimeException("用户不存在");
        }

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", landlord.getId());
        profile.put("account", landlord.getAccount());
        profile.put("name", landlord.getName());
        profile.put("phone", landlord.getPhone());
        profile.put("email", landlord.getEmail());
        profile.put("createdAt", landlord.getCreatedAt());

        return profile;
    }

    @Transactional
    public Map<String, Object> updateProfile(String landlordId, ProfileUpdateRequest request) {
        Landlord landlord = landlordMapper.findById(landlordId);
        if (landlord == null) {
            throw new RuntimeException("用户不存在");
        }

        if (StringUtils.hasText(request.getName())) {
            landlord.setName(request.getName().trim());
        }

        if (StringUtils.hasText(request.getPhone())) {
            String phone = request.getPhone().trim();
            Landlord existing = landlordMapper.findByPhone(phone);
            if (existing != null && !existing.getId().equals(landlordId)) {
                throw new RuntimeException("手机号已被使用");
            }
            landlord.setPhone(phone);
        }

        if (StringUtils.hasText(request.getEmail())) {
            String email = request.getEmail().trim();
            Landlord existing = landlordMapper.findByEmail(email);
            if (existing != null && !existing.getId().equals(landlordId)) {
                throw new RuntimeException("邮箱已被使用");
            }
            landlord.setEmail(email);
        }

        if (StringUtils.hasText(request.getOldPassword()) && StringUtils.hasText(request.getNewPassword())) {
            if (!passwordEncoder.matches(request.getOldPassword(), landlord.getPassword())) {
                throw new RuntimeException("原密码错误");
            }
            if (request.getNewPassword().length() < 6) {
                throw new RuntimeException("新密码长度至少6位");
            }
            landlordMapper.updatePassword(landlord.getId(), passwordEncoder.encode(request.getNewPassword()));
        }

        landlord.setUpdatedAt(LocalDateTime.now());
        landlordMapper.update(landlord);

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", landlord.getId());
        profile.put("account", landlord.getAccount());
        profile.put("name", landlord.getName());
        profile.put("phone", landlord.getPhone());
        profile.put("email", landlord.getEmail());

        return profile;
    }
}
