package com.nearbyneeds.controller;

import com.nearbyneeds.model.Notification;
import com.nearbyneeds.model.User;
import com.nearbyneeds.service.AuthService;
import com.nearbyneeds.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    @Autowired
    public NotificationController(NotificationService notificationService, AuthService authService) {
        this.notificationService = notificationService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<?> getNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = authService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found!"));

        List<Notification> notifications = notificationService.getNotificationsForUser(user);
        return ResponseEntity.ok(notifications);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = authService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found!"));

        notificationService.markAsRead(id, user);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }
}
