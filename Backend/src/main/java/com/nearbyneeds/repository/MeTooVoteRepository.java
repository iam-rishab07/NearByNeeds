package com.nearbyneeds.repository;

import com.nearbyneeds.model.MeTooVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MeTooVoteRepository extends JpaRepository<MeTooVote, Long> {
    boolean existsByIssueIdAndUserId(Long issueId, Long userId);
}
