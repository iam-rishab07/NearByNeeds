package com.nearbyneeds.controller;

import com.nearbyneeds.model.Issue;
import com.nearbyneeds.model.Penalty;
import com.nearbyneeds.model.User;
import com.nearbyneeds.repository.PenaltyRepository;
import com.nearbyneeds.service.AuthService;
import com.nearbyneeds.service.IssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AuthService authService;
    private final IssueService issueService;
    private final PenaltyRepository penaltyRepository;

    @Autowired
    public UserController(AuthService authService, IssueService issueService, PenaltyRepository penaltyRepository) {
        this.authService = authService;
        this.issueService = issueService;
        this.penaltyRepository = penaltyRepository;
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

    @GetMapping("/me/issues")
    public ResponseEntity<?> getMyIssues(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = authService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found!"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Issue> myIssues = issueService.getIssuesByUserId(user.getId(), pageable);
        return ResponseEntity.ok(myIssues);
    }

    @GetMapping("/me/penalties")
    public ResponseEntity<?> getMyPenalties(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = authService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found!"));

        List<Penalty> penalties = penaltyRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(penalties);
    }
}
