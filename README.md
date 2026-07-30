# Groundwater Level Telemetry Prediction System

A production-ready full-stack machine learning web application for forecasting groundwater levels across 18 hydrological telemetry stations in Meghalaya. The system integrates an **XGBoost Regressor** trained on 5-year 6-hourly telemetry data with a **Java Spring Boot REST API** backend and a modern **React (Vite)** dashboard frontend.

---

## 🌟 Architecture Overview

```
 ┌───────────────────────────┐         HTTP / JSON        ┌───────────────────────────────┐
 │   React (Vite) Frontend   │  ────────────────────────> │   Spring Boot (Java) Backend  │
 │   Deployed on Vercel      │  <──────────────────────── │   Deployed on Render / Railway│
 └───────────────────────────┘                            └──────────────┬────────────────┘
                                                                         │ ProcessBuilder (JSON)
                                                                         ▼
                                                          ┌───────────────────────────────┐
                                                          │  Python XGBoost ML Engine     │
                                                          │  groundwater_model.joblib     │
                                                          └───────────────────────────────┘
```

---

## 📁 Project Structure

```
GW Prediction/
├── frontend/                     # React (Vite) Single Page Application
│   ├── src/
│   │   ├── components/           # Reusable UI Components
│   │   │   ├── Header.jsx        # Navigation & Status header
│   │   │   ├── FeatureForm.jsx   # Input form with validation & auto-calculations
│   │   │   ├── SamplePresets.jsx # Quick-load test scenarios
│   │   │   ├── PredictionResult.jsx # Result gauge & classification display
│   │   │   ├── MetricsOverview.jsx # Station dataset analytics
│   │   │   └── ErrorAlert.jsx    # User-friendly error alert box
│   │   ├── services/
│   │   │   └── api.js            # Axios HTTP client for Spring Boot API
│   │   ├── utils/
│   │   │   ├── validators.js     # Form validation rules
│   │   │   └── samplePresets.js  # Preset station test data
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css             # Glassmorphism dark design system & CSS tokens
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json               # Vercel deployment routing
│
├── backend/                      # Spring Boot (Java 17) REST API
│   ├── src/
│   │   └── main/
│   │       ├── java/com/gwprediction/
│   │       │   ├── GwPredictionApplication.java
│   │       │   ├── controller/
│   │       │   │   ├── PredictionController.java # POST /api/predict & GET /api/health
│   │       │   │   └── StationController.java    # GET /api/stations
│   │       │   ├── dto/
│   │       │   │   ├── PredictionRequest.java   # Request DTO with Jakarta validations
│   │       │   │   ├── PredictionResponse.java  # Structured JSON output DTO
│   │       │   │   └── StationDto.java          # Station metadata DTO
│   │       │   ├── service/
│   │       │   │   ├── PredictionService.java   # Business logic & auto calculations
│   │       │   │   └── PythonBridgeService.java # Java ProcessBuilder bridge to Python
│   │       │   ├── config/
│   │       │   │   └── CorsConfig.java          # CORS rules for Vercel frontend
│   │       │   └── exception/
│   │       │       └── GlobalExceptionHandler.java # Custom exception handling
│   │       └── resources/
│   │           ├── application.properties
│   │           └── application-prod.properties
│   ├── pom.xml
│   └── .mvn/
│
├── ml-model/                     # Python Machine Learning Package
│   ├── train_model.py            # Model training & serialization script
│   ├── predict_script.py         # CLI inference runner executed by Java
│   ├── groundwater_model.joblib  # Serialized XGBoost model (300 estimators)
│   ├── stations.json             # Station list and categorical mapping
│   ├── model_meta.json           # MAE & RMSE evaluation metadata
│   └── requirements.txt
│
├── Dockerfile                    # Multi-stage Docker deployment build
├── render.yaml                   # Render.com service blueprint
└── README.md                     # Documentation
```

---

## 🛠️ Machine Learning Model Details

- **Dataset**: `gwl_tel_6_hourly_meghalaya_ml_2021_2025.csv` (51,987 telemetry samples).
- **Target Variable**: Groundwater Level Telemetry 6-Hourly (`meters`).
- **Algorithm**: `XGBRegressor` (`n_estimators=300, learning_rate=0.05, max_depth=6, subsample=0.8, colsample_bytree=0.8`).
- **Performance**:
  - **Mean Absolute Error (MAE)**: `0.9140 meters`
  - **Root Mean Squared Error (RMSE)**: `3.7275 meters`
- **Features Used (13 Input Features)**:
  1. `Year`, `Month`, `Day`, `Hour`, `DayOfYear`
  2. `GWL_lag1` (6h prior depth)
  3. `GWL_lag2` (12h prior depth)
  4. `GWL_lag4` (24h prior depth)
  5. `GWL_diff_1` (`GWL_lag1 - GWL_lag2`)
  6. `GWL_roll_mean_24h` (24h rolling mean)
  7. `GWL_roll_mean_48h` (48h rolling mean)
  8. `GWL_roll_std_24h` (24h rolling standard deviation)
  9. `Station_Code` (Categorical encoding of station name)

---

## 🚀 Local Setup & Installation

### Prerequisites
- **Java JDK 17** or higher
- **Node.js 18+** & npm
- **Python 3.10+**

### 1. Train the Python ML Model
```bash
# Navigate to project root
cd "d:/GW Prediction"

# Install Python dependencies
pip install -r ml-model/requirements.txt

# Run model training
python ml-model/train_model.py
```

### 2. Start Spring Boot Backend
```bash
cd backend

# On Windows
mvnw.cmd spring-boot:run

# On Linux/macOS
./mvnw spring-boot:run
```
Backend will start on `http://localhost:8080`.

### 3. Start React Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend will start on `http://localhost:5173`.

---

## 📖 API Documentation

### 1. Predict Groundwater Level
- **Endpoint**: `POST /api/predict`
- **Content-Type**: `application/json`

**Sample Request Payload**:
```json
{
  "station": "Shillong",
  "stationCode": 14,
  "year": 2024,
  "month": 6,
  "day": 15,
  "hour": 12,
  "dayOfYear": 167,
  "gwlLag1": 15.2,
  "gwlLag2": 15.4,
  "gwlLag4": 15.7,
  "gwlDiff1": -0.2,
  "gwlRollMean24h": 15.25,
  "gwlRollMean48h": 15.35,
  "gwlRollStd24h": 0.06
}
```

**Sample Response**:
```json
{
  "status": "success",
  "predictedGwlMeter": 15.0069,
  "classification": "Optimal / Normal Range",
  "station": "Shillong",
  "stationCode": 14,
  "unit": "meters",
  "inputsEvaluated": {
    "Year": 2024,
    "Month": 6,
    "Day": 15,
    "Hour": 12,
    "DayOfYear": 167,
    "GWL_lag1": 15.2,
    "GWL_lag2": 15.4,
    "GWL_lag4": 15.7,
    "GWL_diff_1": -0.2,
    "GWL_roll_mean_24h": 15.25,
    "GWL_roll_mean_48h": 15.35,
    "GWL_roll_std_24h": 0.06,
    "Station_Code": 14
  },
  "timestamp": 1722271234000
}
```

### 2. Get Telemetry Stations
- **Endpoint**: `GET /api/stations`
- **Response**: Array of 18 station objects with codes and names.

### 3. Backend Health Check
- **Endpoint**: `GET /api/health`
- **Response**: `{"status": "UP", "service": "Groundwater Level Prediction API"}`

---

## 🌐 Production Deployment Guide

### Deploying Frontend on Vercel

1. Push code to GitHub repository.
2. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your repository and set the **Root Directory** to `frontend`.
4. Build settings will automatically detect Vite:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://your-backend-render-url.onrender.com` (Your deployed Spring Boot public URL)
6. Click **Deploy**.

### Deploying Spring Boot Backend on Render / Railway

#### Option A: Deploy via Docker (Recommended)
1. Sign in to [Render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Select **Docker** environment (Render automatically uses the included `Dockerfile`).
5. Set Environment Variables:
   - `PORT`: `8080`
   - `ALLOWED_ORIGINS`: `https://your-vercel-app.vercel.app`
6. Click **Create Web Service**.

#### Option B: Deploy via Render Blueprint
1. Click **New +** -> **Blueprint**.
2. Select repository containing `render.yaml`. Render will automatically configure the container service.

---

## ⚙️ Environment Variables Summary

| Scope | Variable Name | Default / Local | Description |
|---|---|---|---|
| **Frontend** | `VITE_API_BASE_URL` | `""` (Proxy to localhost:8080) | Public URL of deployed Spring Boot Backend |
| **Backend** | `PORT` | `8080` | Port for Spring Boot web server |
| **Backend** | `ALLOWED_ORIGINS` | `*` | Allowed CORS origins (e.g. Vercel domain) |
| **Backend** | `PYTHON_PATH` | `python` / `python3` | Path to Python binary for ProcessBuilder |
| **Backend** | `MODEL_SCRIPT_PATH` | `ml-model/predict_script.py` | Relative path to Python inference script |
