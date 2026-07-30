import os
import sys
import json
import numpy as np
import pandas as pd
import joblib
from flask import Flask, render_template, request, jsonify

# Compute absolute base path for Vercel Serverless compatibility
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATES_DIR = os.path.join(BASE_DIR, 'templates')
STATIC_DIR = os.path.join(BASE_DIR, 'static')
MODEL_DIR = os.path.join(BASE_DIR, 'model')

app = Flask(
    __name__,
    template_folder=TEMPLATES_DIR,
    static_folder=STATIC_DIR
)

# Global variables for model and metadata loaded once at startup
MODEL = None
STATION_MAP = {}
STATION_LIST = []
MODEL_META = {}

def load_artifacts():
    global MODEL, STATION_MAP, STATION_LIST, MODEL_META
    try:
        model_path = os.path.join(MODEL_DIR, 'xgboost_model.pkl')
        if not os.path.exists(model_path):
            model_path = os.path.join(BASE_DIR, '..', 'ml-model', 'groundwater_model.joblib')

        if os.path.exists(model_path):
            MODEL = joblib.load(model_path)
            print(f"Successfully loaded XGBoost model from {model_path}")
        else:
            print(f"Warning: Model file not found at {model_path}")

        stations_file = os.path.join(MODEL_DIR, 'stations.json')
        if not os.path.exists(stations_file):
            stations_file = os.path.join(BASE_DIR, '..', 'ml-model', 'stations.json')

        if os.path.exists(stations_file):
            with open(stations_file, 'r') as f:
                data = json.load(f)
                STATION_LIST = data.get('stations', [])
                STATION_MAP = data.get('station_map', {})

        if not STATION_LIST:
            default_names = [
                'Amlarem', 'Barengapara', 'Byrnihat', 'Damas_1', 'Jowai',
                'Khliehriat', 'Latyrke', 'Mairang', 'Mawkyrwat_1', 'Nongstoin_1',
                'Panchiring', 'Phulbari_1', 'Rongjeng_1', 'Saiden', 'Shillong',
                'Soksan', 'Williamnagar', 'Zikzak_1'
            ]
            STATION_LIST = [{'code': i, 'name': name} for i, name in enumerate(default_names)]
            STATION_MAP = {name: i for i, name in enumerate(default_names)}

    except Exception as e:
        print(f"Error loading model artifacts: {e}")

# Load model artifacts once when module is imported
load_artifacts()

@app.route('/')
def home():
    return render_template('index.html', stations=STATION_LIST)

@app.route('/api/stations', methods=['GET'])
def get_stations():
    return jsonify({'status': 'success', 'stations': STATION_LIST})

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'UP',
        'service': 'Flask XGBoost Groundwater Level Prediction API',
        'model_loaded': MODEL is not None,
        'stations_count': len(STATION_LIST)
    })

@app.route('/predict', methods=['POST'])
def predict():
    if MODEL is None:
        load_artifacts()
        if MODEL is None:
            return jsonify({
                'status': 'error',
                'message': 'ML Model not loaded on server.'
            }), 500

    try:
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()

        # Station & Code Resolution
        station_name = str(data.get('station', '')).strip()
        station_code = data.get('station_code') or data.get('stationCode')

        if station_code is None or station_code == '':
            station_code = STATION_MAP.get(station_name, 0)
        else:
            station_code = int(station_code)

        # Date & Temporal Inputs
        year = int(data.get('year', 2024))
        month = int(data.get('month', 6))
        day = int(data.get('day', 15))
        hour = int(data.get('hour', 12))

        # Auto-compute DayOfYear if missing
        day_of_year = data.get('day_of_year') or data.get('dayOfYear')
        if day_of_year is None or int(day_of_year) <= 0:
            try:
                day_of_year = pd.Timestamp(year=year, month=month, day=day).dayofyear
            except Exception:
                day_of_year = 167
        else:
            day_of_year = int(day_of_year)

        # GWL Lags
        gwl_lag1 = float(data.get('gwl_lag1') or data.get('gwlLag1') or 15.2)
        gwl_lag2 = float(data.get('gwl_lag2') or data.get('gwlLag2') or 15.4)
        gwl_lag4 = float(data.get('gwl_lag4') or data.get('gwlLag4') or 15.7)

        # GWL Diff 1
        gwl_diff_1 = data.get('gwl_diff_1') or data.get('gwlDiff1')
        if gwl_diff_1 is None or gwl_diff_1 == '':
            gwl_diff_1 = gwl_lag1 - gwl_lag2
        else:
            gwl_diff_1 = float(gwl_diff_1)

        # Rolling Statistics
        gwl_roll_mean_24h = float(data.get('gwl_roll_mean_24h') or data.get('gwlRollMean24h') or gwl_lag1)
        gwl_roll_mean_48h = float(data.get('gwl_roll_mean_48h') or data.get('gwlRollMean48h') or ((gwl_lag1 + gwl_lag2) / 2.0))
        gwl_roll_std_24h = float(data.get('gwl_roll_std_24h') or data.get('gwlRollStd24h') or 0.05)

        # Feature Order matching training EXACTLY
        features_order = [
            'Year', 'Month', 'Day', 'Hour', 'DayOfYear',
            'GWL_lag1', 'GWL_lag2', 'GWL_lag4',
            'GWL_diff_1', 'GWL_roll_mean_24h', 'GWL_roll_mean_48h', 'GWL_roll_std_24h',
            'Station_Code'
        ]

        row = {
            'Year': year,
            'Month': month,
            'Day': day,
            'Hour': hour,
            'DayOfYear': day_of_year,
            'GWL_lag1': gwl_lag1,
            'GWL_lag2': gwl_lag2,
            'GWL_lag4': gwl_lag4,
            'GWL_diff_1': gwl_diff_1,
            'GWL_roll_mean_24h': gwl_roll_mean_24h,
            'GWL_roll_mean_48h': gwl_roll_mean_48h,
            'GWL_roll_std_24h': gwl_roll_std_24h,
            'Station_Code': station_code
        }

        df_input = pd.DataFrame([row])[features_order]
        predicted_val = float(MODEL.predict(df_input)[0])
        predicted_val_rounded = round(predicted_val, 4)

        # Water level risk classification
        if predicted_val < 5.0:
            classification = "Shallow Water Table (High Surface Runoff Risk)"
            status_class = "danger"
        elif predicted_val <= 35.0:
            classification = "Optimal / Normal Range"
            status_class = "success"
        elif predicted_val <= 60.0:
            classification = "Moderately Deep Ground Water"
            status_class = "warning"
        else:
            classification = "Deep Water Table (Depleted / Water Stress)"
            status_class = "danger"

        response = {
            'status': 'success',
            'predicted_gwl_meter': predicted_val_rounded,
            'classification': classification,
            'status_class': status_class,
            'station': station_name if station_name else f"Code {station_code}",
            'station_code': station_code,
            'unit': 'meters',
            'inputs_evaluated': row
        }

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.is_json:
            return jsonify(response)
        
        return render_template(
            'index.html',
            stations=STATION_LIST,
            prediction=response,
            form_data=data
        )

    except Exception as e:
        err_msg = f"Prediction computation failed: {str(e)}"
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.is_json:
            return jsonify({'status': 'error', 'message': err_msg}), 400
        return render_template('index.html', stations=STATION_LIST, error=err_msg)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
