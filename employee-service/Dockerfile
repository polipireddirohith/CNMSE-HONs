# ==============================================================================
# Multi-Stage Production Dockerfile for Spring Boot Microservice (HON6 CI/CD)
# ==============================================================================

# Stage 1: Build stage with Maven & Eclipse Temurin JDK 17
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Cache dependency layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and compile jar
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime stage with minimal JRE footprint
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create unprivileged system group and user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy compiled jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Enforce non-root execution
USER appuser

# Expose Spring Boot server port
EXPOSE 8081

# Container healthcheck querying Spring Boot Actuator
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8081/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
