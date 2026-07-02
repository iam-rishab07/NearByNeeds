package com.nearbyneeds.controller;

import com.nearbyneeds.model.Issue;
import com.nearbyneeds.service.IssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService issueService;

    @Autowired
    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    /**
     * POST /api/issues
     * Submit a new issue.
     */
    @PostMapping
    public ResponseEntity<Issue> createIssue(@RequestBody Issue issue) {
        Issue created = issueService.createIssue(issue);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * GET /api/issues/nearby
     * Get nearby issues based on lat, long, and radius.
     */
    @GetMapping("/nearby")
    public ResponseEntity<List<Issue>> getNearbyIssues(
            @RequestParam BigDecimal lat,
            @RequestParam BigDecimal lon,
            @RequestParam(defaultValue = "10.0") double radius) { // Default radius 10km
        
        List<Issue> issues = issueService.getNearbyIssues(lat, lon, radius);
        return ResponseEntity.ok(issues);
    }

    /**
     * PATCH /api/issues/{id}/upvote
     * Increment the upvotes count of an issue.
     */
    @PatchMapping("/{id}/upvote")
    public ResponseEntity<Issue> upvoteIssue(@PathVariable Long id) {
        return issueService.upvoteIssue(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
