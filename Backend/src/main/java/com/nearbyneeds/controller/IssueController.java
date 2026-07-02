package com.nearbyneeds.controller;

import com.nearbyneeds.model.Comment;
import com.nearbyneeds.model.Issue;
import com.nearbyneeds.model.User;
import com.nearbyneeds.repository.CommentRepository;
import com.nearbyneeds.service.AuthService;
import com.nearbyneeds.service.IssueService;
import com.nearbyneeds.service.StorageService;
import com.nearbyneeds.service.VoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService issueService;
    private final AuthService authService;
    private final StorageService storageService;
    private final VoteService voteService;
    private final CommentRepository commentRepository;

    @Autowired
    public IssueController(IssueService issueService, AuthService authService,
                           StorageService storageService, VoteService voteService,
                           CommentRepository commentRepository) {
        this.issueService = issueService;
        this.authService = authService;
        this.storageService = storageService;
        this.voteService = voteService;
        this.commentRepository = commentRepository;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createIssue(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam(value = "addressText", required = false) String addressText,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        try {
            User user = authService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found!"));

            // Handle file upload
            String fileUrl = storageService.store(file);

            Issue issue = new Issue();
            issue.setTitle(title);
            issue.setDescription(description);
            issue.setLatitude(latitude);
            issue.setLongitude(longitude);
            issue.setAddressText(addressText);
            issue.setPhotoUrls(fileUrl);

            Issue created = issueService.createIssue(issue, user, categoryId);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getIssues(
            @RequestParam(required = false) Issue.Status status,
            @RequestParam(required = false) Long category_id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Issue> issues = issueService.getFilteredIssues(status, category_id, pageable);
        return ResponseEntity.ok(issues);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getIssueById(@PathVariable Long id) {
        return issueService.getIssueById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/me-too")
    public ResponseEntity<?> meTooVote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        try {
            User user = authService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found!"));
            
            Issue updated = voteService.addMeTooVote(id, user);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Comments Endpoints
    @GetMapping("/{id}/comments")
    public ResponseEntity<?> getComments(@PathVariable Long id) {
        List<Comment> comments = commentRepository.findByIssueIdOrderByCreatedAtAsc(id);
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        String content = body.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Comment content cannot be empty"));
        }

        try {
            User user = authService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found!"));
            
            Issue issue = issueService.getIssueById(id)
                    .orElseThrow(() -> new RuntimeException("Issue not found!"));

            Comment comment = new Comment(content, issue, user);
            Comment saved = commentRepository.save(comment);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
