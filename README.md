# NearByNeeds

**Empowering Hyperlocal Civic Engagement**

NearByNeeds is a platform designed to make local community issues visible and actionable. Whether it's a pothole, a broken streetlight, or environmental concerns, NearByNeeds empowers citizens to report, track, and advocate for neighborhood improvements seamlessly.

## 🎯 Our Goal: Hyperlocal Impact
The core mission of NearByNeeds is to bridge the gap between citizens and local authorities by fostering **Hyperlocal Impact**. We believe that large-scale change begins with community-level engagement. By visualizing local issues on a map and providing a platform for community upvoting, we aim to:
- **Democratize Civic Action:** Give every citizen a voice in improving their immediate surroundings.
- **Prioritize Needs:** Use community-driven data (upvotes) to highlight the most pressing issues.
- **Enhance Visibility:** Use spatial mapping to provide a clear, indisputable view of infrastructure, safety, and environmental gaps.

## 🛠 Tech Stack
- **Frontend:** React, React-Leaflet, TailwindCSS (optional for styling)
- **Backend:** Java Spring Boot, Spring Data JPA, Hibernate
- **Database:** MySQL (utilizing spatial capabilities or Haversine proximity queries)

## 📁 Architecture Overview
This repository uses a scalable MVC (Model-View-Controller) architecture:
- `/Frontend`: A React application that requests user geolocation on load and queries the backend for issues within a specific radius.
- `/Backend`: A Spring Boot API that handles issue ingestion, upvoting logic, and complex proximity calculations using the Haversine formula (or MySQL Spatial Indexes).

## 🚀 Getting Started

### Prerequisites
- Node.js & npm (for React)
- Java 17+ & Maven/Gradle (for Spring Boot)
- MySQL Server

### Database Setup
1. Create a MySQL database (e.g., `nearbyneeds`).
2. Run the SQL script found in `Backend/src/main/resources/schema-setup.sql` to generate the required tables and understand spatial indexing options.

### Running the Backend
1. Navigate to `/Backend`.
2. Configure your `application.properties` with your MySQL credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/nearbyneeds
   spring.datasource.username=root
   spring.datasource.password=yourpassword
   ```
3. Run the Spring Boot application (e.g., `./mvnw spring-boot:run`).
4. The server will start on `http://localhost:8080`.

### Running the Frontend
1. Navigate to `/Frontend`.
2. Install dependencies:
   ```bash
   npm install leaflet react-leaflet
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   # or
   npm start
   ```
4. Access the application typically at `http://localhost:5173` or `http://localhost:3000`.

## 🌐 API Endpoints

- `POST /api/issues`: Submit a new civic issue.
- `GET /api/issues/nearby?lat={lat}&lon={lon}&radius={radius}`: Retrieve issues within the given radius (km).
- `PATCH /api/issues/{id}/upvote`: Increment the upvote count of a specific issue.

## 🤝 Contributing
Contributions are welcome! Let's build better communities together.
