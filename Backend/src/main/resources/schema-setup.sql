-- ==============================================================================
-- NearByNeeds Database Schema & Indexing Script
-- ==============================================================================

-- Create the issues table
CREATE TABLE IF NOT EXISTS issues (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(10,8) NOT NULL,
    category ENUM('Infrastructure', 'Environment', 'Safety', 'Other') NOT NULL,
    status ENUM('OPEN', 'RESOLVED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upvotes INT DEFAULT 0
);

-- ==============================================================================
-- Spatial Indexing Explanation for Proximity Searches in MySQL
-- ==============================================================================
/*
While you can use standard DECIMAL columns and the Haversine formula in a native query 
(as implemented in the Spring Data Repository), MySQL offers built-in Spatial Extensions 
that are highly optimized for proximity queries using R-Trees.

To truly optimize proximity searches for millions of records, you should use the `POINT` 
data type and a SPATIAL INDEX instead of just DECIMAL columns.

Here is how you would alter the table to use spatial indexing:

1. Add a spatial column:
   ALTER TABLE issues ADD location POINT SRID 4326;

2. Create a Spatial Index:
   CREATE SPATIAL INDEX spx_location ON issues(location);

3. To populate this column from the latitude/longitude columns:
   UPDATE issues SET location = ST_GeomFromText(CONCAT('POINT(', longitude, ' ', latitude, ')'), 4326);

4. For new inserts, use triggers or handle it at the application layer:
   CREATE TRIGGER issues_location_insert BEFORE INSERT ON issues
   FOR EACH ROW
   SET NEW.location = ST_GeomFromText(CONCAT('POINT(', NEW.longitude, ' ', NEW.latitude, ')'), 4326);

5. The proximity query using the Spatial Index would then look like:
   SELECT * FROM issues 
   WHERE ST_Distance_Sphere(location, ST_GeomFromText('POINT(user_lon user_lat)', 4326)) <= radius_in_meters;
*/
