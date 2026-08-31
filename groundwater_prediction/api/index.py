import os
import sys
import json
import re
from flask import Flask, render_template, request, jsonify, send_file, send_from_directory

# Compute base directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATES_DIR = os.path.join(BASE_DIR, 'templates')
STATIC_DIR = os.path.join(BASE_DIR, 'static')
MODEL_DIR = os.path.join(BASE_DIR, 'model')

app = Flask(
    __name__,
    template_folder=TEMPLATES_DIR,
    static_folder=STATIC_DIR
)

# Global variables for model and metadata
XGB_NATIVE_MODEL = None
JSON_MODEL_DATA = None
STATION_MAP = {}
STATION_LIST = []

def load_artifacts():
    global XGB_NATIVE_MODEL, JSON_MODEL_DATA, STATION_MAP, STATION_LIST
    try:
        # 1. Try loading native XGBoost model via joblib if available
        model_path = os.path.join(MODEL_DIR, 'xgboost_model.pkl')
        if not os.path.exists(model_path):
            model_path = os.path.join(BASE_DIR, '..', 'ml-model', 'groundwater_model.joblib')

        if os.path.exists(model_path):
            try:
                import joblib
                XGB_NATIVE_MODEL = joblib.load(model_path)
            except Exception as ex:
                print(f"Native model load fallback: {ex}")

        # 2. Load lightweight JSON model dump for zero-dependency Vercel serverless execution
        json_model_path = os.path.join(MODEL_DIR, 'model.json')
        if os.path.exists(json_model_path):
            with open(json_model_path, 'r') as f:
                JSON_MODEL_DATA = json.load(f)

        # 3. Load station metadata
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

# Load artifacts once at startup
load_artifacts()

def predict_lightweight(row_dict):
    """Pure Python lightweight XGBoost tree evaluator (0MB dependencies, sub-millisecond)."""
    feats = [
        'Year', 'Month', 'Day', 'Hour', 'DayOfYear',
        'GWL_lag1', 'GWL_lag2', 'GWL_lag4', 'GWL_diff_1',
        'GWL_roll_mean_24h', 'GWL_roll_mean_48h', 'GWL_roll_std_24h',
        'Station_Code'
    ]

    # Native XGBoost model evaluation
    if XGB_NATIVE_MODEL is not None:
        try:
            import pandas as pd
            df_single = pd.DataFrame([row_dict])[feats]
            return float(XGB_NATIVE_MODEL.predict(df_single)[0])
        except Exception:
            pass

    # Pure Python JSON tree evaluator
    if JSON_MODEL_DATA is not None:
        trees = JSON_MODEL_DATA['learner']['gradient_booster']['model']['trees']
        base_score_raw = str(JSON_MODEL_DATA['learner']['learner_model_param'].get('base_score', '0.5'))
        clean_num = re.search(r"[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?", base_score_raw)
        base_score = float(clean_num.group(0)) if clean_num else 0.5

        vec = [float(row_dict.get(f, 0.0)) for f in feats]
        score = base_score

        for tree in trees:
            node = 0
            lefts = tree['left_children']
            rights = tree['right_children']
            splits = tree['split_indices']
            conds = tree['split_conditions']
            weights = tree['base_weights']

            while lefts[node] != -1:
                idx = splits[node]
                val = vec[idx]
                if val < conds[node]:
                    node = lefts[node]
                else:
                    node = rights[node]
            score += weights[node]

        return float(score)

    raise RuntimeError("No valid ML model artifact available.")

from datetime import datetime, timezone, timedelta

def get_rolling_months_ist():
    ist = timezone(timedelta(hours=5, minutes=30))
    now = datetime.now(ist)
    current_year = now.year
    current_month_idx = now.month - 1

    month_names = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    rolling = []
    for offset in range(4):
        total_idx = current_month_idx + offset
        actual_month = (total_idx % 12) + 1
        year = current_year + (total_idx // 12)
        month_name = month_names[actual_month - 1]

        suffix = f"Month {offset + 1}"
        if offset == 0:
            suffix += " – Current Month"
        elif offset == 1:
            suffix += " – Next Month"

        rolling.append({
            'relative_index': offset + 1,
            'actual_month': actual_month,
            'year': year,
            'month_name': month_name,
            'label': f"{month_name} ({suffix})",
            'is_default': (offset == 0)
        })

    return rolling

@app.route('/')
def home():
    rolling_months = get_rolling_months_ist()
    return render_template('index.html', stations=STATION_LIST, rolling_months=rolling_months)

@app.route('/water_wells_map')
@app.route('/water_wells_map.html')
@app.route('/static/water_wells_map.html')
def serve_water_wells_map():
    candidates = [
        os.path.join(STATIC_DIR, 'water_wells_map.html'),
        os.path.join(TEMPLATES_DIR, 'water_wells_map.html'),
        os.path.join(BASE_DIR, 'water_wells_map.html'),
        os.path.join(BASE_DIR, '..', 'water_wells_map.html')
    ]
    for candidate in candidates:
        if os.path.exists(candidate):
            return send_file(candidate, mimetype='text/html')
    return "Map file not found", 404

@app.route('/static/<path:filename>')
def custom_static(filename):
    return send_from_directory(STATIC_DIR, filename)

@app.route('/api/stations', methods=['GET'])
def get_stations():
    return jsonify({'status': 'success', 'stations': STATION_LIST})

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'UP',
        'service': 'Flask XGBoost Groundwater Level Prediction API',
        'model_loaded': (XGB_NATIVE_MODEL is not None) or (JSON_MODEL_DATA is not None),
        'stations_count': len(STATION_LIST)
    })

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'GET':
        rolling_months = get_rolling_months_ist()
        return render_template('index.html', stations=STATION_LIST, rolling_months=rolling_months)
    try:
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()

        station_name = str(data.get('station', '')).strip()
        station_code = data.get('station_code') or data.get('stationCode')

        if station_code is None or station_code == '':
            station_code = STATION_MAP.get(station_name, 0)
        else:
            station_code = int(station_code)

        # Determine IST runtime date defaults & month mapping
        ist = timezone(timedelta(hours=5, minutes=30))
        now_ist = datetime.now(ist)

        rel_month = data.get('relative_month') or data.get('relativeMonth')
        month_raw = data.get('month')

        if rel_month is not None and str(rel_month).strip() in ['1', '2', '3', '4']:
            rel_idx = int(rel_month) - 1
            total_idx = (now_ist.month - 1) + rel_idx
            month = (total_idx % 12) + 1
            year = now_ist.year + (total_idx // 12)
        elif month_raw is not None and str(month_raw).strip() != '':
            month = int(month_raw)
            year = int(data.get('year') or now_ist.year)
        else:
            month = now_ist.month
            year = now_ist.year

        day = int(data.get('day', 15))
        hour = int(data.get('hour', 12))

        # Approximate DayOfYear calculation without requiring heavy pandas
        day_of_year = data.get('day_of_year') or data.get('dayOfYear')
        if day_of_year is None or int(day_of_year) <= 0:
            days_in_months = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
            if (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0):
                days_in_months[2] = 29
            day_of_year = sum(days_in_months[:month]) + day
        else:
            day_of_year = int(day_of_year)

        gwl_lag1 = float(data.get('gwl_lag1') or data.get('gwlLag1') or 15.2)
        gwl_lag2 = float(data.get('gwl_lag2') or data.get('gwlLag2') or 15.4)
        gwl_lag4 = float(data.get('gwl_lag4') or data.get('gwlLag4') or 15.7)

        gwl_diff_1 = data.get('gwl_diff_1') or data.get('gwlDiff1')
        if gwl_diff_1 is None or gwl_diff_1 == '':
            gwl_diff_1 = gwl_lag1 - gwl_lag2
        else:
            gwl_diff_1 = float(gwl_diff_1)

        gwl_roll_mean_24h = float(data.get('gwl_roll_mean_24h') or data.get('gwlRollMean24h') or gwl_lag1)
        gwl_roll_mean_48h = float(data.get('gwl_roll_mean_48h') or data.get('gwlRollMean48h') or ((gwl_lag1 + gwl_lag2) / 2.0))
        gwl_roll_std_24h = float(data.get('gwl_roll_std_24h') or data.get('gwlRollStd24h') or 0.05)

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

        predicted_val = predict_lightweight(row)
        predicted_val_rounded = round(predicted_val, 4)

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
