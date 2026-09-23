package com.vortiq.controller;

import com.vortiq.model.notif.Notification;
import com.vortiq.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(@RequestParam(defaultValue = "1") Long userId) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(@RequestParam(defaultValue = "1") Long userId) {
        Map<String, Object> res = new HashMap<>();
        res.put("unreadCount", notificationService.getUnreadCount(userId));
        return ResponseEntity.ok(res);
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        return ResponseEntity.ok(notificationService.createNotification(notification));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllRead(@RequestParam(defaultValue = "1") Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}
