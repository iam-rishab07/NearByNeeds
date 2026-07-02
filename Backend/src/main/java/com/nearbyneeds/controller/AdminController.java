package com.nearbyneeds.controller;

import com.nearbyneeds.model.Issue;
import com.nearbyneeds.service.AuthService;
import com.nearbyneeds.service.IssueService;
import com.nearbyneeds.service.PenaltyService;
import com.nearbyneeds.service.RewardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/issues")
@PreAuthorize("hasAnyRole('MUNICIPAL_ADMIN', 'SUPER_ADMIN')")
public class AdminController {

    private final IssueService issueService;
    private final RewardService rewardService;
    private final PenaltyService penaltyService;

    @Autowired
    public AdminController(IssueService issueService, RewardService rewardService,
                           PenaltyService penaltyService) {
        this.issueService = issueService;
        this.rewardService = rewardService;
        this.penaltyService = penaltyService;
    }

    @GetMapping
    public ResponseEntity<?> getAdminIssues(
            @RequestParam(required = false) Issue.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Issue> issues = issueService.getFilteredIssues(status, null, pageable);
        return ResponseEntity.ok(issues);
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<?> resolveIssue(
            @PathVariable Long id,
            @RequestBody ResolutionRequest request) {
        
        Issue issue = issueService.getIssueById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found!"));

        if (issue.getStatus() == Issue.Status.RESOLVED || issue.getStatus() == Issue.Status.MARKED_FAKE) {
            return ResponseEntity.badRequest().body(Map.of("error", "Issue is already closed."));
        }

        issue.setStatus(Issue.Status.RESOLVED);
        issue.setResolvedAt(LocalDateTime.now());
        issue.setResolutionNotes(request.resolutionNotes);
        issue = issueService.save(issue);

        // Attribute points
        rewardService.rewardUserForResolution(issue);

        return ResponseEntity.ok(issue);
    }

    @PatchMapping("/{id}/mark-fake")
    public ResponseEntity<?> markFakeIssue(
            @PathVariable Long id,
            @RequestBody ResolutionRequest request) {
        
        Issue issue = issueService.getIssueById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found!"));

        if (issue.getStatus() == Issue.Status.RESOLVED || issue.getStatus() == Issue.Status.MARKED_FAKE) {
            return ResponseEntity.badRequest().body(Map.of("error", "Issue is already closed."));
        }

        issue.setStatus(Issue.Status.MARKED_FAKE);
        issue.setResolutionNotes(request.resolutionNotes);
        issue = issueService.save(issue);

        // Apply penalty engine
        penaltyService.applyPenalty(issue);

        return ResponseEntity.ok(issue);
    }

    public static class ResolutionRequest {
        public String resolutionNotes;
    }
}
