package com.nearbyneeds.controller;

import com.nearbyneeds.model.Role;
import com.nearbyneeds.model.User;
import com.nearbyneeds.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = new User();
            user.setFullName(request.fullName);
            user.setEmail(request.email);
            user.setPhone(request.phone);
            user.setPassword(request.password);
            
            // Allow setting role during registration for easy testing
            if (request.role != null) {
                user.setRole(request.role);
            } else {
                user.setRole(Role.CITIZEN);
            }

            User registered = authService.register(user);
            return ResponseEntity.ok(registered);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = authService.login(request.email, request.password);
            User user = authService.findByEmail(request.email)
                    .orElseThrow(() -> new RuntimeException("User not found!"));
            
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "user", user
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = authService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found!"));
        return ResponseEntity.ok(user);
    }

    public static class RegisterRequest {
        public String fullName;
        public String email;
        public String phone;
        public String password;
        public Role role;
    }

    public static class LoginRequest {
        public String email;
        public String password;
    }
}
