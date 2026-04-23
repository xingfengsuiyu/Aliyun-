package com.rental.entity;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    
    private String id;
    
    private String landlordId;
    
    private String tenantId;
    
    private Sender sender;
    
    private String content;
    
    private MessageType messageType;
    
    private String attachmentUrl;
    
    @Builder.Default
    private Boolean isRead = false;
    
    private LocalDateTime createdAt;
    
    public enum Sender {
        房东, 租客
    }
    
    public enum MessageType {
        文字, 图片, 文件
    }
}
