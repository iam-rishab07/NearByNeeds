# 🌍 GeoVoice

> **Empowering Hyperlocal Civic Engagement Through Community Voices**

GeoVoice is a modern civic engagement platform that enables citizens to report, discover, verify, and track public issues in their locality such as potholes, garbage dumps, broken streetlights, water leakages, illegal dumping, and other civic infrastructure problems.

Using geolocation, interactive maps, community validation, and municipal workflows, GeoVoice bridges the communication gap between citizens and local authorities, making cities smarter, cleaner, and more responsive.

---

# ✨ Features

### 👥 Citizen Features

- 📍 Report civic issues with precise GPS location
- 🗺️ Interactive map showing nearby issues
- 👍 Vote ("Me Too") on existing issues
- 🔍 Discover nearby issues within a configurable radius
- 📸 Upload supporting images
- 📈 Track issue status in real time
- 🏆 Earn rewards for genuine reports
- ⚠️ Receive penalties for fake or misleading reports

---

### 🏛 Municipal Admin Features

- Review newly reported issues
- Verify issue authenticity
- Approve or reject reports
- Update issue status
- Resolve verified issues
- Monitor community engagement
- Prioritize highly voted issues

---

### 🚀 Platform Features

- Secure JWT Authentication
- Role-Based Access Control
- Geospatial search using latitude & longitude
- Interactive Leaflet Maps
- Community-driven issue prioritization
- RESTful API architecture
- Scalable Spring Boot backend

---

# 🎯 Vision

GeoVoice aims to empower every citizen to actively participate in improving their neighborhood.

Instead of issues remaining unnoticed, GeoVoice provides a transparent platform where citizens and municipal authorities collaborate to solve civic problems efficiently.

Our mission is to create **Hyperlocal Impact** by ensuring that:

- Every citizen has a voice.
- Community participation improves governance.
- Genuine issues receive faster attention.
- Transparency builds trust between citizens and authorities.
- Data-driven prioritization leads to smarter cities.

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router
- React Leaflet
- Axios

---

## Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- JWT Authentication
- Maven

---

## Database

- MySQL

---

## Geospatial

- Haversine Formula
- MySQL Spatial Queries (Optional)

---

## Tools

- Git
- GitHub
- Postman
- IntelliJ IDEA
- VS Code

---

# 📂 Project Structure

```
GeoVoice
│
├── Frontend
│   ├── React Application
│   ├── Pages
│   ├── Components
│   ├── Services
│   ├── Context
│   ├── Hooks
│   └── Leaflet Maps
│
├── Backend
│   ├── Controllers
│   ├── Services
│   ├── Repositories
│   ├── DTOs
│   ├── Entities
│   ├── Security
│   ├── Configurations
│   └── REST APIs
│
└── Database
    └── MySQL
```

---

# 🏗️ System Architecture

GeoVoice follows a scalable layered architecture.

```
React Frontend
        │
        ▼
Spring Boot REST API
        │
        ▼
Service Layer
        │
        ▼
Spring Data JPA
        │
        ▼
MySQL Database
```

---

# 🚀 Getting Started

## Prerequisites

Install the following before running the project:

- Java 21+
- Maven
- Node.js
- npm
- MySQL Server

---

# ⚙️ Backend Setup

Clone the repository

```bash
git clone https://github.com/iam-rishab07/GeoVoice.git
```

Navigate to backend

```bash
cd Backend
```

Configure database credentials inside

```
src/main/resources/application.properties
```

Example

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/geovoice
spring.datasource.username=root
spring.datasource.password=yourpassword
```

Run the backend

```bash
./mvnw spring-boot:run
```

The backend will start at

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

Run the application

```bash
npm run dev
```

Frontend will start at

```
http://localhost:5173
```

---

# 🗄 Database Setup

Create a MySQL database named

```
geovoice
```

Import the SQL schema.

Update the credentials in

```
application.properties
```

---

# 🔐 User Roles

GeoVoice supports three user roles.

| Role | Description |
|------|-------------|
| SUPER_ADMIN | Platform administration |
| MUNICIPAL_ADMIN | Reviews and resolves civic issues |
| CITIZEN | Reports, votes, and tracks issues |

---

# 🌐 REST APIs

## Authentication

```
POST /api/auth/register
POST /api/auth/login
```

---

## Issues

### Create Issue

```
POST /api/issues
```

### Get Nearby Issues

```
GET /api/issues/nearby
```

Parameters

| Parameter | Description |
|----------|-------------|
| lat | Latitude |
| lon | Longitude |
| radius | Radius in kilometers |

---

### Get All Issues

```
GET /api/issues
```

---

### Get Issue By ID

```
GET /api/issues/{id}
```

---

### Update Issue Status

```
PATCH /api/issues/{id}/status
```

---

### Vote ("Me Too")

```
PATCH /api/issues/{id}/vote
```

---

# 📸 Screenshots

```
screenshots/

├── Home.png
├── Login.png
├── Register.png
├── Dashboard.png
├── Issue Details.png
├── Report Issue.png
├── Map View.png
├── Admin Dashboard.png
└── Profile.png
```

(Add screenshots after deployment.)

---

# 🔮 Roadmap

- AI Duplicate Issue Detection
- Image Moderation
- Push Notifications
- Email Notifications
- Reward & Gamification System
- Leaderboards
- Government Analytics Dashboard
- Heatmaps
- Mobile Application
- Progressive Web App (PWA)

---

# 🔒 Security

- JWT Authentication
- Password Encryption (BCrypt)
- Role-Based Authorization
- Secure REST APIs
- Input Validation

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository.

2. Create a feature branch.

```bash
git checkout -b feature-name
```

3. Commit your changes.

```bash
git commit -m "Add new feature"
```

4. Push your branch.

```bash
git push origin feature-name
```

5. Open a Pull Request.

---

# 🧪 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| SUPER_ADMIN | vrushabh@geovoice.com | vrushabh@1234 |
| MUNICIPAL_ADMIN | nirupam@geovoice.com | nirupam@1234 |
| CITIZEN | ajinkya@gmail.com | ajinkya@1234 |
| CITIZEN | tanay@gmail.com | tanay@1234 |

---

# 📜 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you found GeoVoice helpful, consider giving the repository a ⭐ on GitHub.

Your support motivates further development and helps the project reach more developers.

---

# 👨‍💻 Author

## Vrushabh Gorivale

**GitHub**

https://github.com/iam-rishab07

**LinkedIn**

https://www.linkedin.com/in/vrushabh07/
