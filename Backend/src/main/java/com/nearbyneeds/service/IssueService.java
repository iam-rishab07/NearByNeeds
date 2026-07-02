package com.nearbyneeds.service;

import com.nearbyneeds.model.*;
import com.nearbyneeds.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class IssueService {

    private final IssueRepository issueRepository;
    private final IssueCategoryRepository categoryRepository;

    @Autowired
    public IssueService(IssueRepository issueRepository, IssueCategoryRepository categoryRepository) {
        this.issueRepository = issueRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public Issue createIssue(Issue issue, User user, Long categoryId) {
        if (user.getAccountStatus() != User.AccountStatus.ACTIVE) {
            throw new RuntimeException("Suspended or banned users cannot post issues!");
        }

        IssueCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found!"));
        
        issue.setUser(user);
        issue.setCategory(category);
        issue.setStatus(Issue.Status.OPEN);
        issue.setMeTooCount(0);

        return issueRepository.save(issue);
    }

    public Page<Issue> getFilteredIssues(Issue.Status status, Long categoryId, Pageable pageable) {
        if (status != null && categoryId != null) {
            return issueRepository.findByStatusAndCategoryId(status, categoryId, pageable);
        } else if (status != null) {
            return issueRepository.findByStatus(status, pageable);
        } else if (categoryId != null) {
            return issueRepository.findByCategoryId(categoryId, pageable);
        } else {
            return issueRepository.findAll(pageable);
        }
    }

    public Optional<Issue> getIssueById(Long id) {
        return issueRepository.findById(id);
    }

    public List<Issue> getNearbyIssues(Double lat, Double lon, double radius) {
        return issueRepository.findNearbyIssues(lat, lon, radius);
    }

    @Transactional
    public Issue save(Issue issue) {
        return issueRepository.save(issue);
    }

    public Page<Issue> getIssuesByUserId(Long userId, Pageable pageable) {
        return issueRepository.findByUserId(userId, pageable);
    }
}
