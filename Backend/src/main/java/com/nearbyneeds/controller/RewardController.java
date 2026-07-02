package com.nearbyneeds.controller;

import com.nearbyneeds.model.Redemption;
import com.nearbyneeds.model.RewardCatalog;
import com.nearbyneeds.model.RewardTransaction;
import com.nearbyneeds.model.User;
import com.nearbyneeds.service.AuthService;
import com.nearbyneeds.service.RewardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rewards")
public class RewardController {

    private final RewardService rewardService;
    private final AuthService authService;

    @Autowired
    public RewardController(RewardService rewardService, AuthService authService) {
        this.rewardService = rewardService;
        this.authService = authService;
    }

    @GetMapping("/catalog")
    public ResponseEntity<?> getCatalog() {
        List<RewardCatalog> catalog = rewardService.getCatalog();
        return ResponseEntity.ok(catalog);
    }

    @PostMapping("/redeem/{catalogId}")
    public ResponseEntity<?> redeemReward(
            @PathVariable Long catalogId,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = authService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found!"));

        try {
            Redemption redemption = rewardService.redeemReward(catalogId, user);
            return ResponseEntity.ok(redemption);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getMyTransactions(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = authService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found!"));

        List<RewardTransaction> transactions = rewardService.getMyTransactions(user);
        return ResponseEntity.ok(transactions);
    }
}
