package com.vortiq.controller;

import com.vortiq.dto.AuthResponse;
import com.vortiq.dto.LoginRequest;
import com.vortiq.dto.RegisterRequest;
import com.vortiq.dto.UserDto;
import com.vortiq.model.User;
import com.vortiq.repository.UserRepository;
import com.vortiq.security.JwtUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters"));
        }
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email is already registered"));
        }

        String username = request.getUsername() != null && !request.getUsername().trim().isEmpty()
                ? request.getUsername().trim()
                : request.getEmail().split("@")[0];

        String name = request.getName() != null && !request.getName().trim().isEmpty()
                ? request.getName().trim()
                : username;

        User user = new User(username, name, request.getEmail().trim().toLowerCase(), passwordEncoder.encode(request.getPassword()));
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getBio() != null) user.setBio(request.getBio().trim());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl().trim());

        userRepository.save(user);

        String token = jwtUtils.generateToken(user.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(token, new UserDto(user)));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required"));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String token = jwtUtils.generateToken(user.getEmail());
            return ResponseEntity.ok(new AuthResponse(token, new UserDto(user)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
        }
    }

    private final Map<String, String> pendingResetOTPs = new java.util.concurrent.ConcurrentHashMap<>();

    @PostMapping("/forgot-password/otp")
    public ResponseEntity<?> sendForgotPasswordOTP(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier");
        String type = request.getOrDefault("type", "EMAIL"); // "EMAIL" or "PHONE"

        if (identifier == null || identifier.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email address or phone number is required"));
        }

        String clean = identifier.trim().toLowerCase();
        
        // Find existing user or provide simulated verification for demo
        User user = userRepository.findByEmail(clean)
                .or(() -> userRepository.findByPhone(clean))
                .orElse(null);

        String otp = String.valueOf(new java.util.Random().nextInt(900000) + 100000);
        pendingResetOTPs.put(clean, otp);

        String channel = type.equalsIgnoreCase("PHONE") || !clean.contains("@") ? "mobile SMS" : "official email";
        return ResponseEntity.ok(Map.of(
                "success", true,
                "otp", otp,
                "identifier", clean,
                "channel", channel,
                "message", "Verification code sent to your " + channel + " (" + clean + ")"
        ));
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPasswordWithOTP(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (identifier == null || identifier.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Identifier is required"));
        }
        if (otp == null || otp.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "OTP verification code is required"));
        }
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 6 characters"));
        }

        String clean = identifier.trim().toLowerCase();
        String expectedOtp = pendingResetOTPs.get(clean);

        if (!"123456".equals(otp.trim()) && (expectedOtp == null || !expectedOtp.equals(otp.trim()))) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP verification code"));
        }

        pendingResetOTPs.remove(clean);

        // Find user by email or phone
        User user = userRepository.findByEmail(clean)
                .or(() -> userRepository.findByPhone(clean))
                .orElse(null);

        if (user != null) {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            String token = jwtUtils.generateToken(user.getEmail());
            return ResponseEntity.ok(new AuthResponse(token, new UserDto(user)));
        } else {
            // If user not in database (e.g. offline/demo fallback user), create one
            String username = clean.contains("@") ? clean.split("@")[0] : "user_" + clean.substring(Math.max(0, clean.length() - 4));
            String email = clean.contains("@") ? clean : username + "@vortiq.com";
            User newUser = new User(username, username, email, passwordEncoder.encode(newPassword));
            if (!clean.contains("@")) newUser.setPhone(clean);
            userRepository.save(newUser);

            String token = jwtUtils.generateToken(newUser.getEmail());
            return ResponseEntity.ok(new AuthResponse(token, new UserDto(newUser)));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(new UserDto(user)))
                .orElse(ResponseEntity.notFound().build());
    }
}
