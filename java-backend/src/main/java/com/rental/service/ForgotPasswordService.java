package com.rental.service;

import com.rental.entity.Landlord;
import com.rental.entity.VerificationCode;
import com.rental.mapper.LandlordMapper;
import com.rental.mapper.VerificationCodeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ForgotPasswordService {

    private final LandlordMapper landlordMapper;
    private final VerificationCodeMapper verificationCodeMapper;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public void sendVerificationCode(String email) {
        Landlord landlord = landlordMapper.findByEmail(email);
        if (landlord == null) {
            throw new RuntimeException("该邮箱未注册");
        }

        String code = String.format("%06d", (int) (Math.random() * 1000000));

        VerificationCode verificationCode = VerificationCode.builder()
                .id(UUID.randomUUID().toString())
                .email(email)
                .code(code)
                .type(VerificationCode.VerificationType.FORGOT_PASSWORD)
                .used(false)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build();

        verificationCodeMapper.insert(verificationCode);
        emailService.sendVerificationCode(email, code);
    }

    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("密码长度至少6位");
        }

        VerificationCode verificationCode = verificationCodeMapper
                .findByEmailAndType(email, VerificationCode.VerificationType.FORGOT_PASSWORD.name(), false);

        if (verificationCode == null) {
            throw new RuntimeException("验证码无效或已过期");
        }

        if (!verificationCode.getCode().equals(code)) {
            throw new RuntimeException("验证码错误");
        }

        Landlord landlord = landlordMapper.findByEmail(email);
        if (landlord == null) {
            throw new RuntimeException("用户不存在");
        }

        landlordMapper.updatePassword(landlord.getId(), passwordEncoder.encode(newPassword));
        verificationCodeMapper.markAsUsed(verificationCode.getId());
    }
}