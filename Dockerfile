# Stage 1: Build Java backend
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY backend/pom.xml ./backend/
COPY backend/src ./backend/src/
WORKDIR /app/backend
RUN mvn clean package -DskipTests

# Stage 2: Production runtime with Java 17 + Python 3 + ML libraries
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Install Python 3 and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements & install
COPY ml-model/requirements.txt ./ml-model/
RUN pip3 install --no-cache-dir -r ml-model/requirements.txt

# Copy ML model artifacts & scripts
COPY ml-model/ ./ml-model/
COPY gwl_tel_6_hourly_meghalaya_ml_2021_2025.csv ./

# Copy compiled jar from build stage
COPY --from=build /app/backend/target/gw-prediction-backend-1.0.0.jar ./app.jar

ENV PORT=8080
ENV PYTHON_PATH=python3
ENV MODEL_SCRIPT_PATH=ml-model/predict_script.py
EXPOSE 8080

CMD ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
