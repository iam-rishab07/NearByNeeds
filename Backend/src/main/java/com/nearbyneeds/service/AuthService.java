package com.nearbyneeds.service;

import com.nearbyneeds.model.User;
import com.nearbyneeds.repository.UserRepository;
import com.nearbyneeds.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, 
                       JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public User register(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered!");
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRewardPoints(0);
        user.setFakeReportCount(0);
        user.setAccountStatus(User.AccountStatus.ACTIVE);
        
        return userRepository.save(user);
    }

    public String login(String email, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        
        if (user.getAccountStatus() == User.AccountStatus.BANNED) {
            throw new RuntimeException("This account is permanently banned!");
        }
        if (user.getAccountStatus() == User.AccountStatus.SUSPENDED) {
            throw new RuntimeException("This account is suspended until " + user.getSuspensionUntil());
        }
        
        return jwtUtil.generateToken(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
