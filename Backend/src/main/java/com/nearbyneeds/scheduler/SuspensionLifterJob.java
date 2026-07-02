package com.nearbyneeds.scheduler;

import com.nearbyneeds.model.User;
import com.nearbyneeds.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@EnableScheduling
public class SuspensionLifterJob {

    private final UserRepository userRepository;

    @Autowired
    public SuspensionLifterJob(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Runs every hour to check for expired user suspensions and restore account status.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void liftSuspensions() {
        List<User> users = userRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        for (User user : users) {
            if (user.getAccountStatus() == User.AccountStatus.SUSPENDED 
                    && user.getSuspensionUntil() != null 
                    && user.getSuspensionUntil().isBefore(now)) {
                
                user.setAccountStatus(User.AccountStatus.ACTIVE);
                user.setSuspensionUntil(null);
                userRepository.save(user);
                System.out.println("Auto-restored suspended account for: " + user.getEmail());
            }
        }
    }
}
