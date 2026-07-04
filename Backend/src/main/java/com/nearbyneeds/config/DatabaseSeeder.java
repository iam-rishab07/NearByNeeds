package com.nearbyneeds.config;

import com.nearbyneeds.model.Role;
import com.nearbyneeds.model.User;
import com.nearbyneeds.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        List<SeedUser> targetUsers = Arrays.asList(
            new SeedUser("vrushabh@geovoice.com", "Vrushabh Gorivale", "vrushabh@1234", Role.SUPER_ADMIN),
            new SeedUser("nirupam@geovoice.com", "Nirupam Shinde", "nirupam@1234", Role.MUNICIPAL_ADMIN),
            new SeedUser("ajinkya@gmail.com", "Ajinkya Dhole", "ajinkya@1234", Role.CITIZEN),
            new SeedUser("tanay@gmail.com", "Tanay Gorivale", "tanay@1234", Role.CITIZEN)
        );

        Set<String> targetEmails = targetUsers.stream().map(SeedUser::getEmail).collect(Collectors.toSet());

        // Check if we need to clean up and re-seed
        List<User> existingUsers = userRepository.findAll();
        boolean hasOtherUsers = existingUsers.stream().anyMatch(u -> !targetEmails.contains(u.getEmail()));
        boolean isMissingAny = targetUsers.stream().anyMatch(tu -> userRepository.findByEmail(tu.getEmail()).isEmpty());

        if (hasOtherUsers || isMissingAny) {
            System.out.println("DatabaseSeeder: Syncing users as requested (keeping only the 4 requested users)...");

            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();

            // Delete references for users to be deleted to avoid constraint issues
            entityManager.createNativeQuery("DELETE FROM comments WHERE user_id NOT IN (SELECT id FROM users WHERE email IN ('vrushabh@geovoice.com', 'nirupam@geovoice.com', 'ajinkya@gmail.com', 'tanay@gmail.com'))").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM me_too_votes WHERE user_id NOT IN (SELECT id FROM users WHERE email IN ('vrushabh@geovoice.com', 'nirupam@geovoice.com', 'ajinkya@gmail.com', 'tanay@gmail.com'))").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM issue_votes WHERE user_id NOT IN (SELECT id FROM users WHERE email IN ('vrushabh@geovoice.com', 'nirupam@geovoice.com', 'ajinkya@gmail.com', 'tanay@gmail.com'))").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM penalties WHERE user_id NOT IN (SELECT id FROM users WHERE email IN ('vrushabh@geovoice.com', 'nirupam@geovoice.com', 'ajinkya@gmail.com', 'tanay@gmail.com'))").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM notifications WHERE user_id NOT IN (SELECT id FROM users WHERE email IN ('vrushabh@geovoice.com', 'nirupam@geovoice.com', 'ajinkya@gmail.com', 'tanay@gmail.com'))").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM redemptions WHERE user_id NOT IN (SELECT id FROM users WHERE email IN ('vrushabh@geovoice.com', 'nirupam@geovoice.com', 'ajinkya@gmail.com', 'tanay@gmail.com'))").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM reward_transactions WHERE user_id NOT IN (SELECT id FROM users WHERE email IN ('vrushabh@geovoice.com', 'nirupam@geovoice.com', 'ajinkya@gmail.com', 'tanay@gmail.com'))").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM issues WHERE user_id NOT IN (SELECT id FROM users WHERE email IN ('vrushabh@geovoice.com', 'nirupam@geovoice.com', 'ajinkya@gmail.com', 'tanay@gmail.com'))").executeUpdate();

            // Delete users other than target emails
            entityManager.createNativeQuery("DELETE FROM users WHERE email NOT IN ('vrushabh@geovoice.com', 'nirupam@geovoice.com', 'ajinkya@gmail.com', 'tanay@gmail.com')").executeUpdate();

            // Now upsert/create the target users
            for (SeedUser tu : targetUsers) {
                User user = userRepository.findByEmail(tu.getEmail()).orElse(new User());
                user.setEmail(tu.getEmail());
                user.setFullName(tu.getFullName());
                user.setPassword(passwordEncoder.encode(tu.getPassword()));
                user.setRole(tu.getRole());
                if (user.getId() == null) {
                    if (tu.getRole() == Role.SUPER_ADMIN) user.setRewardPoints(150);
                    else if (tu.getRole() == Role.MUNICIPAL_ADMIN) user.setRewardPoints(100);
                    else if (tu.getEmail().equals("ajinkya@gmail.com")) user.setRewardPoints(50);
                    else user.setRewardPoints(0);
                }
                userRepository.save(user);
            }

            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();
            System.out.println("DatabaseSeeder: Sync completed. Only the 4 requested users exist in the database.");
        } else {
            System.out.println("DatabaseSeeder: Users are already up to date. Skipping sync.");
        }
    }

    private static class SeedUser {
        private final String email;
        private final String fullName;
        private final String password;
        private final Role role;

        public SeedUser(String email, String fullName, String password, Role role) {
            this.email = email;
            this.fullName = fullName;
            this.password = password;
            this.role = role;
        }

        public String getEmail() { return email; }
        public String getFullName() { return fullName; }
        public String getPassword() { return password; }
        public Role getRole() { return role; }
    }
}
