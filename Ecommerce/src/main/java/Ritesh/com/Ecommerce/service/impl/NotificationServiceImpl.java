package Ritesh.com.Ecommerce.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import Ritesh.com.Ecommerce.dto.NotificationDto;
import Ritesh.com.Ecommerce.entity.Notification;
import Ritesh.com.Ecommerce.entity.User;
import Ritesh.com.Ecommerce.exception.ResourceNotFoundException;
import Ritesh.com.Ecommerce.exception.UnauthorizedException;
import Ritesh.com.Ecommerce.mapper.DtoMapper;
import Ritesh.com.Ecommerce.repository.NotificationRepository;
import Ritesh.com.Ecommerce.repository.UserRepository;
import Ritesh.com.Ecommerce.service.NotificationService;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void createNotification(Long userId, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationDto> getUserNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(user.getId()).stream()
                .map(DtoMapper::toNotificationDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, String email) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getEmail().equals(email)) {
            throw new UnauthorizedException("You are not authorized to access this notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }
}
