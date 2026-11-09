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
| **HON 5** | Containerization & Kubernetes Orchestration | Docker, Docker Compose, Kubernetes, Minikube, kubectl | [HON5.md](./HON5.md) |
| **HON 6** | Microservices DevOps CI/CD & Monitoring | GitHub Actions, Spring Boot Actuator, Prometheus, Multi-stage Docker | [HON6.md](./HON6.md) |

---

## 📁 Repository Structure

```
CNMSE-HONs/
├── .github/
│   └── workflows/
│       └── ci-cd.yml                 # Master GitHub Actions CI/CD Pipeline Configuration
├── HON1.md                       # Monolithic e-commerce breakdown & microservices architecture
├── HON2.md                       # To-Do REST API documentation with Swagger UI details
├── HON3.md                       # Spring Boot Employee Management microservice documentation
├── HON4.md                       # Product Catalog microservice documentation with Postman proofs
├── HON5.md                       # Containerization (Docker) & Orchestration (Kubernetes/Minikube)
├── HON6.md                       # DevOps CI/CD Pipeline Automation & Monitoring Deliverable
├── ci-cd-run-screenshot.png      # Verified GitHub Actions successful CI/CD pipeline screenshot
├── kubectl-pods-screenshot.png   # Verified terminal screenshot of running pods in Minikube
├── docker-compose.yml            # Docker Compose orchestration file
│
├── k8s/                          # Kubernetes Manifests (Module 5)
│   ├── deployment.yaml           # Deployment manifest with 2 replicas, probes, resource limits
│   ├── service.yaml              # NodePort service manifest exposing port 30080
│   └── kubectl-pods-screenshot.png # Verification screenshot
│
├── todo-api/                     # HON2 & HON5 & HON6: Node.js Express REST API
│   ├── Dockerfile                # Production Alpine Dockerfile (non-root, layer cached)
│   ├── .dockerignore             # Docker ignore configuration
│   ├── server.js                 # Express server with Swagger, /health and /metrics endpoints
│   ├── package.json              # Dependencies and test runner script
│   ├── test-ci.js                # Automated CI test suite (CRUD, Health & Prometheus)
│   ├── postman_collection.json   # Exported Postman collection for all CRUD endpoints
│   ├── test-api.js               # End-to-end automated test runner
│   ├── swagger-ui-screenshot.png # Live Swagger UI screenshot
│   └── k8s/                      # Kubernetes manifests directory
│       ├── deployment.yaml
│       └── service.yaml
│
├── employee-service/             # HON3 & HON6: Spring Boot Microservice
│   ├── pom.xml                   # Maven build file (Spring Web, JPA, H2, Actuator, Prometheus)
│   ├── Dockerfile                # Multi-stage production containerfile (Eclipse Temurin 17)
│   ├── .dockerignore             # Container ignore configuration
│   └── src/
│       ├── main/java/com/example/employeeservice/
│       │   ├── EmployeeServiceApplication.java
│       │   ├── controller/EmployeeController.java
│       │   ├── entity/Employee.java
│       │   ├── exception/GlobalExceptionHandler.java
│       │   ├── repository/EmployeeRepository.java
│       │   └── service/impl/EmployeeServiceImpl.java
│       ├── main/resources/
│       │   ├── application.properties # Exposes health, info, metrics, prometheus
│       │   └── data.sql
│       └── test/java/com/example/employeeservice/
│           ├── EmployeeControllerTest.java
│           └── ActuatorHealthTest.java # Actuator and Prometheus test suite
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

### HON5: Containerization & Kubernetes (Docker + Minikube)
```bash
# 1. Build and run locally with Docker
docker build -t todo-api:v1 ./todo-api
docker run -d -p 3000:3000 --name todo-api-test todo-api:v1

# Or with Docker Compose
docker compose up -d

# 2. Deploy to Minikube
minikube start --driver=docker
minikube image load todo-api:v1
kubectl apply -f k8s/

# 3. Verify deployment and pods
kubectl get pods -o wide
kubectl get deployments
kubectl get services

# 4. Access the service
minikube service todo-api-service
```

### HON6: DevOps CI/CD Pipeline & Monitoring
```bash
# 1. Trigger GitHub Actions CI/CD Pipeline
git push origin main
# The workflow executes automatically at .github/workflows/ci-cd.yml

# 2. Run local tests & verify Actuator metrics for Employee Service
cd employee-service
mvn test
# Start service and inspect Actuator Health & Prometheus metrics:
mvn spring-boot:run
curl http://localhost:8081/actuator/health
curl http://localhost:8081/actuator/prometheus

# 3. Run automated CI test suite for To-Do API
cd todo-api
npm test
curl http://localhost:3000/health
curl http://localhost:3000/metrics
```

