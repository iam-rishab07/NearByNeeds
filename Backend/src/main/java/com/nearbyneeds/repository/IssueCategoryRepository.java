package com.nearbyneeds.repository;

import com.nearbyneeds.model.IssueCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IssueCategoryRepository extends JpaRepository<IssueCategory, Long> {
    Optional<IssueCategory> findByName(String name);
}
