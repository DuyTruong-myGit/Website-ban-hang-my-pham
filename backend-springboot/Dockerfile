# AI hỗ trợ: Tạo Dockerfile multi-stage build để deploy Spring Boot lên Render
# ========== STAGE 1: Build ==========
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copy Maven wrapper và pom.xml trước (tận dụng Docker cache)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Cấp quyền thực thi cho mvnw
RUN chmod +x mvnw

# Download dependencies (cache layer)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build JAR (bỏ qua test để deploy nhanh hơn)
RUN ./mvnw package -DskipTests -B

# ========== STAGE 2: Run ==========
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy JAR từ stage build
COPY --from=build /app/target/*.jar app.jar

# Expose port (Render sẽ tự set PORT qua biến môi trường)
EXPOSE 8080

# Chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]
