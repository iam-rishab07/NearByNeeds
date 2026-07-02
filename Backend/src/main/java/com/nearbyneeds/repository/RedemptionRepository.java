package com.nearbyneeds.repository;

import com.nearbyneeds.model.Redemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RedemptionRepository extends JpaRepository<Redemption, Long> {
    List<Redemption> findByUserIdOrderByCreatedAtDesc(Long userId);
}
