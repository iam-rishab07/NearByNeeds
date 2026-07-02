package com.nearbyneeds.service;

import com.nearbyneeds.model.Issue;
import com.nearbyneeds.model.MeTooVote;
import com.nearbyneeds.model.User;
import com.nearbyneeds.repository.IssueRepository;
import com.nearbyneeds.repository.MeTooVoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VoteService {

    private final MeTooVoteRepository meTooVoteRepository;
    private final IssueRepository issueRepository;
    private final EscalationService escalationService;

    @Autowired
    public VoteService(MeTooVoteRepository meTooVoteRepository, IssueRepository issueRepository,
                       EscalationService escalationService) {
        this.meTooVoteRepository = meTooVoteRepository;
        this.issueRepository = issueRepository;
        this.escalationService = escalationService;
    }

    @Transactional
    public Issue addMeTooVote(Long issueId, User user) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found!"));

        if (issue.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You cannot vote on your own reported issue!");
        }

        if (meTooVoteRepository.existsByIssueIdAndUserId(issueId, user.getId())) {
            throw new RuntimeException("You have already voted 'Me Too' on this issue!");
        }

        // Only open issues can receive Me Too votes
        if (issue.getStatus() != Issue.Status.OPEN) {
            throw new RuntimeException("Cannot vote on issues that are already " + issue.getStatus());
        }

        // Save vote
        MeTooVote vote = new MeTooVote(issue, user);
        meTooVoteRepository.save(vote);

        // Increment count
        issue.setMeTooCount(issue.getMeTooCount() + 1);
        issue = issueRepository.save(issue);

        // Trigger escalation check
        if (issue.getMeTooCount() > 5) {
            escalationService.escalateIssue(issue);
        }

        return issue;
    }
}
