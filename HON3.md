# Hands-On Exercise 3 (HON3): Employee Management Microservice with Spring Boot, JPA, and H2

## 1. Project Overview & Architecture
This microservice manages employee records using **Spring Boot 3**, **Spring Data JPA**, and an embedded in-memory **H2 Database** engine with Jakarta Bean Validation (`@Valid`).

- **Base URL:** `http://localhost:8081/api/v1/employees`
- **H2 Web Console URL:** `http://localhost:8081/h2-console`
- **Database JDBC URL:** `jdbc:h2:mem:employeedb`
- **Source Directory:** [`c:\CNMS.HONS\employee-service`](file:///c:/CNMS.HONS/employee-service)

```
+---------------------------------------------------------------------------------+
|                        SPRING BOOT ARCHITECTURE LAYOUT                          |
|                                                                                 |
|  [ HTTP Client / Postman / Browser ]                                            |
|                 | (REST JSON)                                                   |
|                 v                                                               |
|  [ EmployeeController ]    -> Handles GET, POST, PUT, DELETE with @Valid        |
|                 |                                                               |
|                 v                                                               |
|  [ EmployeeService ]       -> Enforces business rules & email uniqueness        |
|                 |                                                               |
|                 v                                                               |
|  [ EmployeeRepository ]    -> Extends JpaRepository<Employee, Long>             |
|                 | (Hibernate / JPA)                                             |
|                 v                                                               |
|  [ Embedded H2 DB ]        -> In-memory relational storage (mem:employeedb)     |
+---------------------------------------------------------------------------------+
```

---

## 2. Dependencies Configured (`pom.xml`)

| Dependency | Purpose |
| :--- | :--- |
| `spring-boot-starter-web` | Provides Spring MVC, embedded Tomcat container, and REST endpoint controllers. |
| `spring-boot-starter-data-jpa` | Provides Spring Data repository abstractions and Hibernate ORM engine. |
| `spring-boot-starter-validation` | Hibernate Validator for Jakarta Bean Validation annotations (`@NotBlank`, `@Email`, `@Positive`). |
| `com.h2database:h2` | Lightweight, zero-config in-memory relational database. |
| `spring-boot-starter-test` | JUnit 5 and `MockMvc` for controller integration testing. |

---

## 3. In-Memory H2 Database Configuration

Configured in [`src/main/resources/application.properties`](file:///c:/CNMS.HONS/employee-service/src/main/resources/application.properties):

```properties
server.port=8081

# In-Memory H2 Database
spring.datasource.url=jdbc:h2:mem:employeedb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password

# H2 Console GUI
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.h2.console.settings.web-allow-others=true

# JPA / Hibernate
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

## 4. Endpoints & CRUD Implementation

### A. Employee Entity with Field Validations
Implemented in [`Employee.java`](file:///c:/CNMS.HONS/employee-service/src/main/java/com/example/employeeservice/entity/Employee.java):
- `@NotBlank(message = "Employee name cannot be blank")`
- `@NotBlank(message = "Employee email cannot be blank")`
- `@Email(message = "Email must be a valid email address format")`
- `@NotBlank(message = "Department cannot be blank")`
- `@NotBlank(message = "Role cannot be blank")`
- `@NotNull` and `@Positive(message = "Salary must be greater than zero")`

### B. Summary of Endpoints

| HTTP Method | Endpoint URL | Description | Expected Status |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/employees` | Retrieve all employees | `200 OK` |
| **GET** | `/api/v1/employees/{id}` | Retrieve single employee by ID | `200 OK` / `404 Not Found` |
| **POST** | `/api/v1/employees` | Create a new employee (validates request body) | `201 Created` / `400 Bad Request` |
| **PUT** | `/api/v1/employees/{id}` | Update existing employee details | `200 OK` / `400 Bad Request` / `404 Not Found` |
| **DELETE** | `/api/v1/employees/{id}` | Delete employee record by ID | `200 OK` / `404 Not Found` |

---

## 5. Deliverables

### A. GitHub Repository Link
The project is organized in the root workspace Git repository:
- **Local Project Path:** `C:\CNMS.HONS\employee-service`
- **GitHub Repository URL:** `https://github.com/rohit/cloud-native-microservices-hons`
- **Push Instructions to your remote GitHub repository:**
  ```bash
  cd C:\CNMS.HONS
  git remote add origin https://github.com/<your-username>/cloud-native-microservices-hons.git
  git branch -M main
  git push -u origin main
  ```

---

### B. Sample JSON Responses

#### 1. Endpoint: `POST /api/v1/employees` (Successful Creation)
- **Status:** `201 Created`
- **Request Payload:**
  ```json
  {
    "name": "David Miller",
    "email": "david.miller@example.com",
    "department": "Infrastructure",
    "role": "Cloud Platform Engineer",
    "salary": 118000.00
  }
  ```
- **Response JSON:**
  ```json
  {
    "id": 4,
    "name": "David Miller",
    "email": "david.miller@example.com",
    "department": "Infrastructure",
    "role": "Cloud Platform Engineer",
    "salary": 118000.00
  }
  ```

#### 2. Endpoint: `GET /api/v1/employees/1` (Retrieve Single Employee)
- **Status:** `200 OK`
- **Response JSON:**
  ```json
  {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "department": "Engineering",
    "role": "Lead Cloud Architect",
    "salary": 125000.00
  }
  ```

#### 3. Endpoint: `POST /api/v1/employees` (Validation Failure - Blank Name)
- **Status:** `400 Bad Request`
- **Request Payload:**
  ```json
  {
    "name": "",
    "email": "invalid-email-format",
    "department": "Engineering",
    "role": "Engineer",
    "salary": -5000.00
  }
  ```
- **Response JSON:**
  ```json
  {
    "timestamp": "2026-10-28T22:10:00.000",
    "status": 400,
    "error": "Validation Failed",
    "fieldErrors": {
      "name": "Employee name cannot be blank",
      "email": "Email must be a valid email address format",
      "salary": "Salary must be greater than zero"
    }
  }
  ```

#### 4. Endpoint: `GET /api/v1/employees/99` (Resource Not Found)
- **Status:** `404 Not Found`
- **Response JSON:**
  ```json
  {
    "timestamp": "2026-10-28T22:10:00.000",
    "status": 404,
    "error": "Not Found",
    "message": "Employee with ID 99 not found."
  }
  ```

---

## 6. How to Build and Run

1. Open a terminal in `C:\CNMS.HONS\employee-service`.
2. Build and run using Maven:
   ```bash
   mvn clean spring-boot:run
   ```
3. Test endpoints with `curl` or Postman:
   ```bash
   curl -X GET http://localhost:8081/api/v1/employees
   ```
4. Access the in-memory H2 DB web console:
   - Navigate to [http://localhost:8081/h2-console](http://localhost:8081/h2-console)
   - JDBC URL: `jdbc:h2:mem:employeedb`
   - User Name: `sa`
   - Password: `password`
