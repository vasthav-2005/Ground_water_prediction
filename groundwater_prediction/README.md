# Groundwater Level Prediction Flask Web Application

A lightweight, serverless-ready **Python Flask Web Application** for predicting groundwater levels in 18 hydrological telemetry stations across Meghalaya using a pre-trained **XGBoost Regressor** model. Optimized for **1-click serverless deployment on Vercel**.

---

## 📁 Directory Structure

```
groundwater_prediction/
│
├── api/
│   └── index.py             # Flask serverless application entrypoint
│
├── model/
│   ├── xgboost_model.pkl    # Serialized XGBoost model (300 estimators)
│   ├── scaler.pkl           # Feature scaler / normalization object
│   ├── encoder.pkl          # Station categorical encoding map
│   └── stations.json        # 18 Telemetry stations metadata
│
├── templates/
│   └── index.html           # Bootstrap 5 glassmorphic HTML UI
│
├── static/
│   ├── style.css            # Custom CSS styling & glassmorphic theme
│   └── script.js            # Form validation, preset loading & AJAX submit
│
├── requirements.txt         # Serverless Python dependencies
├── vercel.json              # Vercel serverless routing configuration
├── runtime.txt              # Python runtime (python-3.12)
├── .gitignore               # Git ignore rules
└── README.md                # Documentation & Deployment guide
```

---

## ⚡ Features & Model Highlights

- **Fast Cold Start**: Pre-trained XGBoost model loads efficiently once at application startup.
- **Auto Feature Calculations**: Automatically computes `DayOfYear` from dates and `GWL_diff_1` (`Lag 1 - Lag 2`) if omitted by the user.
- **Quick Preset Scenarios**: Instant 1-click test buttons for *Shillong*, *Cherrapunji*, *Jowai*, and *Tura*.
- **Asynchronous Inference**: AJAX form submit via `script.js` updating prediction values, water table status level (Optimal, Shallow, Moderate, Deep), and feature evaluation breakdown without page reloads.

---

## 🛠️ Local Running Instructions

### 1. Install Dependencies
```bash
cd groundwater_prediction
pip install -r requirements.txt
```

### 2. Run Flask App
```bash
python api/index.py
```
*Open **`http://127.0.0.1:5000`** in your web browser.*

---

## 🌐 Vercel Deployment Instructions

### Method A: Deploy via Vercel CLI (Recommended)

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from the `groundwater_prediction` directory:
   ```bash
   cd groundwater_prediction
   vercel --prod
   ```

### Method B: Deploy via GitHub / Vercel Dashboard

1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New Project**.
3. Import your GitHub repository.
4. Set **Root Directory** to `groundwater_prediction`.
5. Click **Deploy**. Vercel will automatically detect `vercel.json` and deploy `api/index.py` as a serverless Python function.

---

## 📡 API Endpoints

### 1. Predict Groundwater Level
- **Endpoint**: `POST /predict`
- **Content-Type**: `application/json` or `application/x-www-form-urlencoded`

**Sample JSON Payload**:
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
  "predicted_gwl_meter": 15.0069,
  "classification": "Optimal / Normal Range",
  "status_class": "success",
  "station": "Shillong",
  "station_code": 14,
  "unit": "meters"
}
```

### 2. Get Telemetry Stations
- **Endpoint**: `GET /api/stations`
- **Response**: List of 18 telemetry stations with codes and names.

### 3. API Health Check
- **Endpoint**: `GET /api/health`
- **Response**: `{"status": "UP", "service": "Flask XGBoost Groundwater Level Prediction API"}`
