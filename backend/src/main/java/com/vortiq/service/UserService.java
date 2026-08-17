package com.vortiq.service;

import com.vortiq.dto.ChangePasswordRequest;
import com.vortiq.dto.UpdateProfileRequest;
import com.vortiq.dto.UserProfileDto;
import com.vortiq.model.User;
import com.vortiq.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserProfileDto getUserProfile(User user) {
        return new UserProfileDto(user);
    }

    @Transactional
    public UserProfileDto updateProfile(User user, UpdateProfileRequest request) {
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty() && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (userRepository.existsByEmail(newEmail)) {
                throw new IllegalStateException("Email address is already in use by another account");
            }
            user.setEmail(newEmail);
        }
        User saved = userRepository.save(user);
        return new UserProfileDto(saved);
    }

    @Transactional
    public void changePassword(User user, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password does not match");
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public List<UserProfileDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserProfileDto::new)
                .collect(Collectors.toList());
    }

    public List<UserProfileDto> searchUsers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllUsers();
        }
        String search = query.trim().toLowerCase();
        return userRepository.findAll().stream()
                .filter(u -> u.getEmail().toLowerCase().contains(search) || 
                             u.getUsername().toLowerCase().contains(search) || 
                             (u.getName() != null && u.getName().toLowerCase().contains(search)) ||
                             (u.getDepartment() != null && u.getDepartment().toLowerCase().contains(search)) ||
                             (u.getPhone() != null && u.getPhone().toLowerCase().contains(search)))
                .map(UserProfileDto::new)
                .collect(Collectors.toList());
    }
}
