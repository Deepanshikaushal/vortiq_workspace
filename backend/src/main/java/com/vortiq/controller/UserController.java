package com.vortiq.controller;

import com.vortiq.dto.ChangePasswordRequest;
import com.vortiq.dto.UpdateProfileRequest;
import com.vortiq.dto.UserProfileDto;
import com.vortiq.model.User;
import com.vortiq.repository.UserRepository;
import com.vortiq.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null) throw new IllegalStateException("Authentication required");
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(userService.getUserProfile(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(userService.updateProfile(user, request));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        try {
            userService.changePassword(user, request);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<UserProfileDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserProfileDto>> searchUsers(
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }
}
