# Tour Management API

A full-stack **Tour Management System** built using **Java Spring Boot**, designed to streamline tour package management, user bookings, authentication, and administrative operations. The project provides secure REST APIs with role-based access control and a scalable backend architecture suitable for real-world travel and tourism platforms.

---

## Features

- User Authentication & Authorization using JWT
- Role-Based Access Control (Admin/User)
- Tour Package Management
- Booking & Reservation System
- Secure RESTful APIs
- MySQL Database Integration
- Exception Handling & Validation
- Layered Architecture (Controller → Service → Repository)
- Spring Security Integration
- CRUD Operations for Tours & Users

---

## Tech Stack

### Backend

- Java 17+
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- Maven

### Database

- MySQL

### Tools & Utilities

- Postman
- Git & GitHub
- IntelliJ IDEA / VS Code

---

## Project Structure

```bash
src/
 ├── controller/
 ├── service/
 ├── repository/
 ├── entity/
 ├── dto/
 ├── security/
 ├── config/
 └── exception/
```

---

## API Functionalities

### Authentication APIs

- User Registration
- User Login
- JWT Token Generation

### Tour APIs

- Create Tour Package
- Update Tour Details
- Delete Tour
- Get All Tours
- Get Tour By ID

### Booking APIs

- Book a Tour
- Cancel Booking
- View User Bookings

---

## Security Features

- Password Encryption using BCrypt
- Stateless Authentication using JWT
- Protected Endpoints with Spring Security
- Role-Based Authorization

---

## Database Configuration

Update your `application.properties` file:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/tour_management
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

## Installation & Setup

### Clone the Repository

```bash
git clone https://github.com/sreya-s0/Tour-Management-API-.git
```

### Navigate to Project Directory

```bash
cd Tour-Management-API-
```

### Build the Project

```bash
mvn clean install
```

### Run the Application

```bash
mvn spring-boot:run
```

---

## API Testing

Use tools like:

- Postman
- Insomnia

Base URL:

```bash
http://localhost:8080
```

---

## Future Improvements

- Payment Gateway Integration
- Email Notifications
- Tour Reviews & Ratings
- Docker Deployment
- Cloud Hosting
- Frontend Integration

---

## Learning Outcomes

This project helped strengthen concepts in:

- Spring Boot REST API Development
- Authentication & Authorization
- Database Design with JPA/Hibernate
- Backend Architecture & Best Practices
- Secure API Development

---

## Author

**VAISAG J**

GitHub:
[GitHub Profile](https://github.com/JVAISAG?utm_source=chatgpt.com)
