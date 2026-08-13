# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Spring Boot JAR with React Bundle
FROM maven:3.9-eclipse-temurin-21 AS backend-builder
WORKDIR /app
COPY backend/pom.xml ./backend/
COPY backend/src ./backend/src
RUN rm -rf ./backend/src/main/resources/static/*
COPY --from=frontend-builder /app/frontend/dist/ ./backend/src/main/resources/static/
RUN mvn -f backend/pom.xml clean package -DskipTests

# Stage 3: Lightweight Production Container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
ENV PORT=8080
COPY --from=backend-builder /app/backend/target/vortiq-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
