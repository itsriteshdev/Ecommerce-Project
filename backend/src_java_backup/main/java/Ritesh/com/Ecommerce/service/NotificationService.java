package Ritesh.com.Ecommerce.service;

import Ritesh.com.Ecommerce.dto.NotificationDto;
import java.util.List;

public interface NotificationService {
    void createNotification(Long userId, String message);
    List<NotificationDto> getUserNotifications(String email);
    void markAsRead(Long notificationId, String email);
}
