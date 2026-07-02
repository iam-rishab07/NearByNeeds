package com.nearbyneeds.repository;

import com.nearbyneeds.model.RewardCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RewardCatalogRepository extends JpaRepository<RewardCatalog, Long> {
    List<RewardCatalog> findByIsActiveTrue();
}
