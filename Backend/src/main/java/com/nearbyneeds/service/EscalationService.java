package com.nearbyneeds.service;

import com.nearbyneeds.model.Issue;
import com.nearbyneeds.model.Role;
import com.nearbyneeds.model.User;
import com.nearbyneeds.repository.IssueRepository;
import com.nearbyneeds.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EscalationService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Autowired
    public EscalationService(IssueRepository issueRepository, UserRepository userRepository,
                             NotificationService notificationService) {
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void escalateIssue(Issue issue) {
        // Double check condition within the transaction
        if (issue.getStatus() == Issue.Status.OPEN && issue.getMeTooCount() > 5) {
            issue.setStatus(Issue.Status.ESCALATED);
            issue.setEscalatedAt(LocalDateTime.now());
            issueRepository.save(issue);

            // Notify Municipal Admins
            List<User> admins = userRepository.findByRole(Role.MUNICIPAL_ADMIN);
            String msg = String.format("Issue escalated in Pune city: '%s'. Needs verification.", issue.getTitle());
            for (User admin : admins) {
                notificationService.createNotification(admin, "ESCALATION", msg, issue.getId());
            }
            
            // Notify original poster
            notificationService.createNotification(
                issue.getUser(), 
                "ESCALATION", 
                String.format("Your issue '%s' has received 6 votes and is now ESCALATED to municipal authorities.", issue.getTitle()), 
                issue.getId()
            );
        }
    }
}
