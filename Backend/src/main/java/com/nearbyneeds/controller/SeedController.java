package com.nearbyneeds.controller;

import com.nearbyneeds.model.*;
import com.nearbyneeds.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/seed")
public class SeedController {

    private final UserRepository userRepository;
    private final IssueCategoryRepository categoryRepository;
    private final RewardCatalogRepository rewardCatalogRepository;
    private final PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public SeedController(UserRepository userRepository,
                          IssueCategoryRepository categoryRepository,
                          RewardCatalogRepository rewardCatalogRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.rewardCatalogRepository = rewardCatalogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> seedData() {
        try {
            // 1. Clear existing data using native SQL to bypass foreign key constraints
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE comments").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE me_too_votes").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE issue_votes").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE notifications").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE penalties").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE redemptions").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE reward_transactions").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE issues").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE reward_catalog").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE users").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE issue_categories").executeUpdate();
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();

            // 2. Seed Categories
            categoryRepository.save(new IssueCategory("Garbage", "/icons/garbage.svg"));
            categoryRepository.save(new IssueCategory("Pothole", "/icons/pothole.svg"));
            categoryRepository.save(new IssueCategory("Streetlight", "/icons/streetlight.svg"));
            categoryRepository.save(new IssueCategory("Water Leakage", "/icons/water.svg"));
            categoryRepository.save(new IssueCategory("Illegal Construction", "/icons/construction.svg"));
            categoryRepository.save(new IssueCategory("Other", "/icons/other.svg"));

            // 3. Seed Rewards Catalog
            rewardCatalogRepository.save(new RewardCatalog("Starbucks Coffee Coupon", "Redeemable for a free tall coffee beverage of choice.", 40, 100, true));
            rewardCatalogRepository.save(new RewardCatalog("Mobile Recharge Voucher", "₹100 mobile talktime/data voucher applicable for all major networks.", 50, 200, true));
            rewardCatalogRepository.save(new RewardCatalog("Movie Ticket Voucher", "One free deluxe movie ticket voucher at any city multiplex.", 90, 80, true));
            rewardCatalogRepository.save(new RewardCatalog("Smart Key Organizer & Fob", "Sleek metallic key holder with bluetooth tracker integration.", 100, 50, true));
            rewardCatalogRepository.save(new RewardCatalog("Eco-friendly Stainless Water Bottle", "Insulated stainless steel bottle (750ml) to keep drinks cold.", 120, 40, true));
            rewardCatalogRepository.save(new RewardCatalog("Wireless Optical Mouse", "Ergonomic 2.4GHz wireless mouse with adjustable DPI settings.", 150, 30, true));
            rewardCatalogRepository.save(new RewardCatalog("1-Month Municipal Parking Pass", "Free parking pass valid in all public municipal parking lots.", 150, 25, true));
            rewardCatalogRepository.save(new RewardCatalog("NearByNeeds Community Hero T-Shirt", "Sleek organic cotton shirt for top civic contributors.", 180, 15, true));
            rewardCatalogRepository.save(new RewardCatalog("Free Monthly Bus Pass", "Unlimited travel pass on city municipal transport buses.", 200, 50, true));
            rewardCatalogRepository.save(new RewardCatalog("1-Week Fitness Gym Pass", "Full access pass to any municipal fitness gym center.", 250, 20, true));
            rewardCatalogRepository.save(new RewardCatalog("10,000mAh Compact Power Bank", "Pocket-sized fast charging backup battery with dual USB output.", 280, 15, true));
            rewardCatalogRepository.save(new RewardCatalog("Mechanical Keyboard & Mouse Combo", "RGB backlit gaming mechanical keyboard and mouse set.", 300, 10, true));
            rewardCatalogRepository.save(new RewardCatalog("Premium Community Hero Hoodie", "Warm heavy-blend fleece hoodie for top-tier contributors.", 350, 10, true));

            // 4. Seed Users
            User superAdmin = new User();
            superAdmin.setFullName("Vrushabh Gorivale");
            superAdmin.setEmail("vrushabh@geovoice.com");
            superAdmin.setPassword(passwordEncoder.encode("vrushabh@1234"));
            superAdmin.setPhone("9876543210");
            superAdmin.setRole(Role.SUPER_ADMIN);
            superAdmin.setRewardPoints(150);
            userRepository.save(superAdmin);

            User municipalAdmin = new User();
            municipalAdmin.setFullName("Nirupam Shinde");
            municipalAdmin.setEmail("nirupam@geovoice.com");
            municipalAdmin.setPassword(passwordEncoder.encode("nirupam@1234"));
            municipalAdmin.setPhone("9876543211");
            municipalAdmin.setRole(Role.MUNICIPAL_ADMIN);
            municipalAdmin.setRewardPoints(100);
            userRepository.save(municipalAdmin);

            User citizen1 = new User();
            citizen1.setFullName("Ajinkya Dhole");
            citizen1.setEmail("ajinkya@gmail.com");
            citizen1.setPassword(passwordEncoder.encode("ajinkya@1234"));
            citizen1.setPhone("9876543212");
            citizen1.setRole(Role.CITIZEN);
            citizen1.setRewardPoints(50);
            userRepository.save(citizen1);

            User citizen2 = new User();
            citizen2.setFullName("Tanay Gorivale");
            citizen2.setEmail("tanay@gmail.com");
            citizen2.setPassword(passwordEncoder.encode("tanay@1234"));
            citizen2.setPhone("9876543213");
            citizen2.setRole(Role.CITIZEN);
            citizen2.setRewardPoints(0);
            userRepository.save(citizen2);

            return ResponseEntity.ok(Map.of("message", "Master data and Pune city demo accounts seeded successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
