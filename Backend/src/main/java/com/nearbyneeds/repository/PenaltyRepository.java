package com.nearbyneeds.repository;

import com.nearbyneeds.model.Penalty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PenaltyRepository extends JpaRepository<Penalty, Long> {
    List<Penalty> findByUserIdOrderByCreatedAtDesc(Long userId);
}
