package com.nearbyneeds.service;

import com.nearbyneeds.model.Issue;
import com.nearbyneeds.model.Penalty;
import com.nearbyneeds.model.User;
import com.nearbyneeds.repository.PenaltyRepository;
import com.nearbyneeds.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PenaltyService {

    private final PenaltyRepository penaltyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Autowired
    public PenaltyService(PenaltyRepository penaltyRepository, UserRepository userRepository,
                          NotificationService notificationService) {
        this.penaltyRepository = penaltyRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Penalty applyPenalty(Issue issue) {
        User user = issue.getUser();
        
        // Increment fake report count
        int offense = user.getFakeReportCount() + 1;
        user.setFakeReportCount(offense);

        double fineAmount = 0;
        int suspensionDays = 0;
        boolean permanentBan = false;

        if (offense == 1) {
            fineAmount = 500;
            suspensionDays = 0;
            permanentBan = false;
        } else if (offense == 2) {
            fineAmount = 1000;
            suspensionDays = 7;
            permanentBan = false;
            
            user.setAccountStatus(User.AccountStatus.SUSPENDED);
            user.setSuspensionUntil(LocalDateTime.now().plusDays(7));
        } else { // 3rd offense or more
            fineAmount = 5000;
            suspensionDays = 0;
            permanentBan = true;
            
            user.setAccountStatus(User.AccountStatus.BANNED);
            user.setSuspensionUntil(null);
        }

        userRepository.save(user);

        // Create penalty record
        Penalty penalty = new Penalty();
        penalty.setUser(user);
        penalty.setIssue(issue);
        penalty.setOffenseNumber(offense);
        penalty.setFineAmount(fineAmount);
        penalty.setSuspensionDays(suspensionDays > 0 ? suspensionDays : null);
        penalty.setIsPermanentBan(permanentBan);
        penalty.setPaymentStatus(Penalty.PaymentStatus.PENDING);
        penalty = penaltyRepository.save(penalty);

        // Notify user
        String alertMsg;
        if (permanentBan) {
            alertMsg = String.format("URGENT: Your report '%s' was marked FAKE. This is your %d offense. Your account is permanently BANNED, and you are fined ₹%.2f.", 
                    issue.getTitle(), offense, fineAmount);
        } else if (suspensionDays > 0) {
            alertMsg = String.format("WARNING: Your report '%s' was marked FAKE. This is your %d offense. Your account is SUSPENDED for 7 days, and you are fined ₹%.2f.", 
                    issue.getTitle(), offense, fineAmount);
        } else {
            alertMsg = String.format("NOTICE: Your report '%s' was marked FAKE. This is your %d offense. You are fined ₹%.2f.", 
                    issue.getTitle(), offense, fineAmount);
        }
        
        notificationService.createNotification(user, "PENALTY", alertMsg, issue.getId());

        return penalty;
    }
}
