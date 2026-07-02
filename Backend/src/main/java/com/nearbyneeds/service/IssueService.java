package com.nearbyneeds.service;

import com.nearbyneeds.model.Issue;
import com.nearbyneeds.repository.IssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class IssueService {

    private final IssueRepository issueRepository;

    @Autowired
    public IssueService(IssueRepository issueRepository) {
        this.issueRepository = issueRepository;
    }

    @Transactional
    public Issue createIssue(Issue issue) {
        // Ensure defaults are set if not provided by client
        if (issue.getStatus() == null) {
            issue.setStatus(Issue.Status.OPEN);
        }
        if (issue.getUpvotes() == null) {
            issue.setUpvotes(0);
        }
        return issueRepository.save(issue);
    }

    public List<Issue> getNearbyIssues(BigDecimal lat, BigDecimal lon, double radius) {
        return issueRepository.findNearbyIssues(lat, lon, radius);
    }

    @Transactional
    public Optional<Issue> upvoteIssue(Long id) {
        return issueRepository.findById(id).map(issue -> {
            issue.setUpvotes(issue.getUpvotes() + 1);
            return issueRepository.save(issue);
        });
    }

    public List<Issue> getAllIssues() {
        return issueRepository.findAll();
    }
}
