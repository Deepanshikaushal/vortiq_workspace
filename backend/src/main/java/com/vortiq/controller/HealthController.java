package com.vortiq.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping({"/api/health", "/health"})
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "vortiq-backend");
        health.put("timestamp", Instant.now().toString());
        health.put("message", "VortiQ Studio Service is operating normally");
        return ResponseEntity.ok(health);
    }
}
