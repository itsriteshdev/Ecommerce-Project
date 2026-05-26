package Ritesh.com.Ecommerce.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import Ritesh.com.Ecommerce.dto.NotificationDto;
import Ritesh.com.Ecommerce.service.NotificationService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getUserNotifications(Principal principal) {
        return ResponseEntity.ok(notificationService.getUserNotifications(principal.getName()));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<String> markAsRead(Principal principal, @PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId, principal.getName());
        return ResponseEntity.ok("Notification marked as read");
    }
}
