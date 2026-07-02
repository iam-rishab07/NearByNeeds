package com.nearbyneeds.service;

import com.nearbyneeds.model.*;
import com.nearbyneeds.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RewardService {

    private final UserRepository userRepository;
    private final RewardCatalogRepository rewardCatalogRepository;
    private final RedemptionRepository redemptionRepository;
    private final RewardTransactionRepository rewardTransactionRepository;
    private final NotificationService notificationService;

    @Autowired
    public RewardService(UserRepository userRepository, RewardCatalogRepository rewardCatalogRepository,
                         RedemptionRepository redemptionRepository,
                         RewardTransactionRepository rewardTransactionRepository,
                         NotificationService notificationService) {
        this.userRepository = userRepository;
        this.rewardCatalogRepository = rewardCatalogRepository;
        this.redemptionRepository = redemptionRepository;
        this.rewardTransactionRepository = rewardTransactionRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public void rewardUserForResolution(Issue issue) {
        User user = issue.getUser();
        int pointsReward = 50; // standard points awarded

        // Update user points
        user.setRewardPoints(user.getRewardPoints() + pointsReward);
        userRepository.save(user);

        // Log transaction
        RewardTransaction transaction = new RewardTransaction(
                user, issue, pointsReward, "Civic issue resolved: " + issue.getTitle()
        );
        rewardTransactionRepository.save(transaction);

        // Send notification
        String msg = String.format("Congratulations! Your reported issue '%s' has been RESOLVED. You have been rewarded %d points.", 
                issue.getTitle(), pointsReward);
        notificationService.createNotification(user, "RESOLUTION", msg, issue.getId());
    }

    public List<RewardCatalog> getCatalog() {
        return rewardCatalogRepository.findByIsActiveTrue();
    }

    public List<RewardTransaction> getMyTransactions(User user) {
        return rewardTransactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @Transactional
    public Redemption redeemReward(Long catalogId, User user) {
        RewardCatalog item = rewardCatalogRepository.findById(catalogId)
                .orElseThrow(() -> new RuntimeException("Reward not found in catalog!"));

        if (!item.getIsActive()) {
            throw new RuntimeException("This reward is currently inactive.");
        }

        if (item.getStockQuantity() <= 0) {
            throw new RuntimeException("This reward is out of stock!");
        }

        if (user.getRewardPoints() < item.getPointsRequired()) {
            throw new RuntimeException("Insufficient points to redeem this reward. Required: " 
                    + item.getPointsRequired() + ", You have: " + user.getRewardPoints());
        }

        // Deduct points
        user.setRewardPoints(user.getRewardPoints() - item.getPointsRequired());
        userRepository.save(user);

        // Decrement stock
        item.setStockQuantity(item.getStockQuantity() - 1);
        rewardCatalogRepository.save(item);

        // Log points transaction
        RewardTransaction transaction = new RewardTransaction(
                user, null, -item.getPointsRequired(), "Redeemed: " + item.getName()
        );
        rewardTransactionRepository.save(transaction);

        // Create redemption record
        Redemption redemption = new Redemption();
        redemption.setUser(user);
        redemption.setRewardCatalog(item);
        redemption.setPointsSpent(item.getPointsRequired());
        redemption.setStatus(Redemption.Status.PENDING);
        redemption = redemptionRepository.save(redemption);

        // Send notification
        notificationService.createNotification(
                user, "REDEMPTION", 
                String.format("Redeemed '%s' for %d points. Status: PENDING.", item.getName(), item.getPointsRequired()), 
                null
        );

        return redemption;
    }
}
