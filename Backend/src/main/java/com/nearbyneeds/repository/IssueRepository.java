package com.nearbyneeds.repository;

import com.nearbyneeds.model.Issue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    @Query(value = """
            SELECT * FROM issues i
            WHERE (
                6371 * acos (
                  cos ( radians(:lat) )
                  * cos( radians( i.latitude ) )
                  * cos( radians( i.longitude ) - radians(:lon) )
                  + sin ( radians(:lat) )
                  * sin( radians( i.latitude ) )
                )
            ) <= :radius
            """, nativeQuery = true)
    List<Issue> findNearbyIssues(
            @Param("lat") Double lat, 
            @Param("lon") Double lon, 
            @Param("radius") double radius
    );

    Page<Issue> findByStatus(Issue.Status status, Pageable pageable);

    Page<Issue> findByCategoryId(Long categoryId, Pageable pageable);

    Page<Issue> findByStatusAndCategoryId(Issue.Status status, Long categoryId, Pageable pageable);

    Page<Issue> findByUserId(Long userId, Pageable pageable);
}
