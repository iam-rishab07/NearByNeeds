# 🌍 NearByNeeds

> **Empowering Hyperlocal Civic Engagement**

NearByNeeds is a community-driven platform that enables citizens to report, discover, and track local civic issues such as potholes, broken streetlights, garbage dumps, water leakages, and other public infrastructure problems.

By combining geolocation, interactive maps, and community voting, NearByNeeds helps prioritize issues that matter the most, making it easier for local authorities and communities to take action.

---

## ✨ Features

- 📍 Report civic issues with precise location
- 🗺️ Interactive map-based issue visualization
- 👍 Community upvoting to prioritize important issues
- 📡 Discover nearby issues within a configurable radius
- 🔍 Hyperlocal search powered by geospatial calculations
- 📈 Transparent tracking of community concerns
- 🚀 Scalable REST API architecture

---

## 🎯 Vision

NearByNeeds aims to bridge the communication gap between citizens and local authorities by creating a transparent, community-driven civic engagement platform.

Our goal is to create **Hyperlocal Impact**, where every citizen can actively contribute to improving their neighborhood.

We believe that:

- Every citizen deserves a voice.
- Community participation drives better governance.
- Data-backed prioritization leads to faster resolution.
- Small local improvements create large societal impact.

---

# 🛠 Tech Stack

### Frontend

- React
- React Leaflet
- Vite
- Tailwind CSS

### Backend

- Java
- Spring Boot
- Spring Data JPA
- Hibernate

### Database

- MySQL

### Geospatial

- Haversine Formula
- MySQL Spatial Queries (optional)

---

# 📂 Project Structure

```
NearByNeeds
│
├── Frontend
│   ├── React Application
│   ├── Leaflet Maps
│   └── UI Components
│
├── Backend
│   ├── Spring Boot REST API
│   ├── Controllers
│   ├── Services
│   ├── Repositories
│   └── Entities
│
└── Database
    └── MySQL
```

---

# 🏗️ Architecture

The project follows a scalable **MVC (Model–View–Controller)** architecture.

### Frontend

- Requests user location
- Displays nearby civic issues
- Allows issue creation
- Enables community voting

### Backend

- Handles REST APIs
- Stores issue information
- Calculates nearby issues using latitude & longitude
- Processes upvotes
- Communicates with MySQL

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed:

- Java 17+
- Maven
- Node.js
- npm
- MySQL Server

---

# ⚙️ Backend Setup

Clone the repository

```bash
git clone https://github.com/iam-rishab07/NearByNeeds.git
```

Navigate to backend

```bash
cd Backend
```

Configure database credentials inside

```
src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/nearbyneeds
spring.datasource.username=root
spring.datasource.password=yourpassword
```

Run the application

```bash
./mvnw spring-boot:run
```

Backend will start at

```
http://localhost:8080
```

---

# 💻 Frontend Setup

Navigate to frontend

```bash
cd Frontend
```

Install dependencies

```bash
npm install
```

Run the project

```bash
npm run dev
```

Frontend will start at

```
http://localhost:5173
```

---

# 🗄️ Database Setup

1. Create a MySQL database named

```
nearbyneeds
```

2. Import your SQL schema.

3. Update the database credentials inside

```
application.properties
```

---

# 🌐 REST API

## Create Issue

```
POST /api/issues
```

---

## Get Nearby Issues

```
GET /api/issues/nearby
```

Parameters

| Parameter | Description |
|-----------|-------------|
| lat | Latitude |
| lon | Longitude |
| radius | Radius in kilometers |

---

## Upvote an Issue

```
PATCH /api/issues/{id}/upvote
```

---

# 📸 Screenshots

> Add screenshots of the application here.

Example:

```
screenshots/
    home.png
    map.png
    report-issue.png
```

---

# 🔮 Future Enhancements

- Authentication & Authorization
- Government/Admin Dashboard
- Issue Status Tracking
- Image Upload Support
- Notifications
- AI-based Duplicate Issue Detection
- Reward & Gamification System
- Leaderboards
- Mobile Application

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Added new feature"
```

4. Push

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📜 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.

It helps the project reach more developers and motivates future improvements.

---

## 👨‍💻 Author

**Vrushabh Gorivale**

GitHub: https://github.com/iam-rishab07

LinkedIn: https://www.linkedin.com/in/vrushabh07/

---
