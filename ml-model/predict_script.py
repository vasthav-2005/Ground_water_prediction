import os
import sys
import json
import base64
import numpy as np
import pandas as pd
import joblib

def predict(input_data):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "groundwater_model.joblib")
    meta_path = os.path.join(base_dir, "stations.json")
    model_meta_path = os.path.join(base_dir, "model_meta.json")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}. Please train the model first.")

    model = joblib.load(model_path)

    station_map = {}
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            station_data = json.load(f)
            station_map = station_data.get("station_map", {})

    features_list = [
        'Year', 'Month', 'Day', 'Hour', 'DayOfYear', 
        'GWL_lag1', 'GWL_lag2', 'GWL_lag4', 
        'GWL_diff_1', 'GWL_roll_mean_24h', 'GWL_roll_mean_48h', 'GWL_roll_std_24h',
        'Station_Code'
    ]

    # Process station input
    station_name = str(input_data.get('station', '')).strip()
    station_code = input_data.get('station_code', None)

    if station_code is None and station_name in station_map:
        station_code = station_map[station_name]
    elif station_code is None:
        station_code = 0

    # Auto compute DayOfYear if missing or 0
    year = int(input_data.get('year', 2025))
    month = int(input_data.get('month', 5))
    day = int(input_data.get('day', 15))
    hour = int(input_data.get('hour', 12))

    day_of_year = input_data.get('day_of_year')
    if day_of_year is None or int(day_of_year) <= 0:
        try:
            day_of_year = pd.Timestamp(year=year, month=month, day=day).dayofyear
        except Exception:
            day_of_year = 135

    # GWL Lags
    gwl_lag1 = float(input_data.get('gwl_lag1', 18.5))
    gwl_lag2 = float(input_data.get('gwl_lag2', 18.6))
    gwl_lag4 = float(input_data.get('gwl_lag4', 18.8))

    # GWL Diff
    gwl_diff_1 = input_data.get('gwl_diff_1')
    if gwl_diff_1 is None:
        gwl_diff_1 = gwl_lag1 - gwl_lag2
    else:
        gwl_diff_1 = float(gwl_diff_1)

    # Rolling statistics
    gwl_roll_mean_24h = float(input_data.get('gwl_roll_mean_24h', gwl_lag1))
    gwl_roll_mean_48h = float(input_data.get('gwl_roll_mean_48h', (gwl_lag1 + gwl_lag2)/2))
    gwl_roll_std_24h = float(input_data.get('gwl_roll_std_24h', 0.05))

    row = {
        'Year': year,
        'Month': month,
        'Day': day,
        'Hour': hour,
        'DayOfYear': int(day_of_year),
        'GWL_lag1': gwl_lag1,
        'GWL_lag2': gwl_lag2,
        'GWL_lag4': gwl_lag4,
        'GWL_diff_1': gwl_diff_1,
        'GWL_roll_mean_24h': gwl_roll_mean_24h,
        'GWL_roll_mean_48h': gwl_roll_mean_48h,
        'GWL_roll_std_24h': gwl_roll_std_24h,
        'Station_Code': int(station_code)
    }

    df_single = pd.DataFrame([row])[features_list]
    pred = float(model.predict(df_single)[0])

    # Groundwater status level classification
    status = "Optimal"
    if pred < 5.0:
        status = "Shallow Water Table (High Risk of Surface Runoff)"
    elif pred <= 35.0:
        status = "Optimal / Normal Range"
    elif pred <= 60.0:
        status = "Moderately Deep Ground Water"
    else:
        status = "Deep Water Table (Depleted / Water Stress)"

    result = {
        "status": "success",
        "predicted_gwl_meter": round(pred, 4),
        "predictedGwlMeter": round(pred, 4),
        "classification": status,
        "station": station_name if station_name else f"Code {station_code}",
        "station_code": int(station_code),
        "stationCode": int(station_code),
        "unit": "meters",
        "inputs_evaluated": row,
        "inputsEvaluated": row
    }
    return result

if __name__ == "__main__":
    try:
        payload = None
        if len(sys.argv) > 1:
            raw_arg = sys.argv[1]
            try:
                decoded_str = base64.b64decode(raw_arg).decode('utf-8')
                payload = json.loads(decoded_str)
            except Exception:
                if os.path.exists(raw_arg):
                    with open(raw_arg, "r") as f:
                        payload = json.load(f)
                else:
                    clean_arg = raw_arg.replace("'", '"')
                    payload = json.loads(clean_arg)
        elif not sys.stdin.isatty():
            stdin_content = sys.stdin.read().strip()
            if stdin_content:
                payload = json.loads(stdin_content)

        if payload is None:
            raise ValueError("No input JSON payload provided.")

        res = predict(payload)
        print(json.dumps(res, indent=2))
    except Exception as e:
        err_res = {
            "status": "error",
            "message": str(e)
        }
        print(json.dumps(err_res), file=sys.stderr)
        sys.exit(1)
