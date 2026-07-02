package com.nearbyneeds.repository;

import com.nearbyneeds.model.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    /**
     * Native query using the Haversine formula to find issues within a given radius.
     * The Earth's radius is approximated at 6371 km.
     * 
     * @param lat the user's latitude
     * @param lon the user's longitude
     * @param radius radius in kilometers
     * @return List of issues within the specified radius
     */
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
            @Param("lat") BigDecimal lat, 
            @Param("lon") BigDecimal lon, 
            @Param("radius") double radius
    );
}
