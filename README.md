# Cloud Native Microservices Engineering - Hands-On Exercises (CNMSE-HONs)

Repository containing completed hands-on exercises for Cloud Native Microservices Engineering.

---

## 📚 Exercises Overview

| Exercise | Topic | Framework / Tech Stack | Documentation |
| :--- | :--- | :--- | :--- |
| **HON 1** | Monolith to Microservices Architecture Redesign | Domain-Driven Design (DDD), Event-Driven Architecture, Kafka | [HON1.md](./HON1.md) |
| **HON 2** | To-Do List REST API with OpenAPI / Swagger | Node.js, Express, Swagger UI (`swagger-ui-express`, `swagger-jsdoc`) | [HON2.md](./HON2.md) |
| **HON 3** | Employee Management Microservice | Spring Boot 3, Spring Data JPA, In-Memory H2 DB, Jakarta Validation | [HON3.md](./HON3.md) |
| **HON 4** | Product Catalog Microservice | Node.js, Express, Mongoose (MongoDB ODM), Centralized Error Handling | [HON4.md](./HON4.md) |

---

## 📁 Repository Structure

```
CNMSE-HONs/
├── HON1.md                       # Monolithic e-commerce breakdown & microservices architecture
├── HON2.md                       # To-Do REST API documentation with Swagger UI details
├── HON3.md                       # Spring Boot Employee Management microservice documentation
├── HON4.md                       # Product Catalog microservice documentation with Postman proofs
│
├── todo-api/                     # HON2: Node.js Express REST API
│   ├── server.js                 # Express server with Swagger JSDoc annotations
│   ├── package.json              # Dependencies (express, swagger-ui-express, swagger-jsdoc)
│   ├── postman_collection.json   # Exported Postman collection for all CRUD endpoints
│   ├── test-api.js               # End-to-end automated test runner
│   └── swagger-ui-screenshot.png # Live Swagger UI screenshot
│
├── employee-service/             # HON3: Spring Boot Microservice
│   ├── pom.xml                   # Maven build file (Spring Web, JPA, H2, Validation)
│   └── src/
│       ├── main/java/com/example/employeeservice/
│       │   ├── EmployeeServiceApplication.java
│       │   ├── controller/EmployeeController.java
│       │   ├── entity/Employee.java
│       │   ├── exception/GlobalExceptionHandler.java
│       │   ├── repository/EmployeeRepository.java
│       │   └── service/impl/EmployeeServiceImpl.java
│       └── main/resources/
│           ├── application.properties
│           └── data.sql
│
└── product-catalog-service/      # HON4: Product Catalog Microservice
    ├── server.js                 # Express server & route registration
    ├── package.json              # Dependencies (express, mongoose, dotenv, cors)
    ├── models/Product.js         # Mongoose schema with field validation rules
    ├── controllers/productController.js # CRUD business logic & query filtering
    ├── middleware/errorHandler.js # Centralized error handling middleware
    ├── postman_collection.json   # Postman collection for CRUD & validation tests
    ├── test-catalog.js           # Automated test suite
    └── postman-screenshot.png    # Live Postman execution screenshot
```

---

## 🚀 How to Run the Projects

### HON2: To-Do REST API
```bash
cd todo-api
npm install
npm start
# Open Swagger UI at http://localhost:3000/api-docs
```

### HON3: Employee Service (Spring Boot)
```bash
cd employee-service
mvn clean spring-boot:run
# Server runs on port 8081. H2 Console: http://localhost:8081/h2-console
```

### HON4: Product Catalog Service
```bash
cd product-catalog-service
npm install
npm start
# Server runs on port 5000. API: http://localhost:5000/products
```
