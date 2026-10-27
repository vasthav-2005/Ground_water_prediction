import json
import re
import pandas as pd
import numpy as np

# Load model.json
with open("groundwater_prediction/model/model.json", "r") as f:
    model_data = json.load(f)

trees = model_data['learner']['gradient_booster']['model']['trees']
base_score_raw = str(model_data['learner']['learner_model_param'].get('base_score', '0.5'))
clean_num = re.search(r"[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?", base_score_raw)
base_score = float(clean_num.group(0)) if clean_num else 0.5

def predict_row(row_dict):
    feats = [
        'Year', 'Month', 'Day', 'Hour', 'DayOfYear',
        'GWL_lag1', 'GWL_lag2', 'GWL_lag4', 'GWL_diff_1',
        'GWL_roll_mean_24h', 'GWL_roll_mean_48h', 'GWL_roll_std_24h',
        'Station_Code'
    ]
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

with open("groundwater_prediction/model/stations.json", "r") as f:
    st_meta = json.load(f)
st_map = st_meta['station_map']

print("Reading CSV...")
df = pd.read_csv('gwl_tel_6_hourly_meghalaya_ml_2021_2025.csv')
time_col = 'Data Acquisition Time'
target_col = 'Groundwater Level Telemetry 6 Hourly (meter)'

df[time_col] = pd.to_datetime(df[time_col], format='%d-%m-%Y %H:%M', errors='coerce')
df = df.dropna(subset=[time_col, target_col, 'Latitude', 'Longitude'])
df = df[(df[target_col] >= -50) & (df[target_col] < 150)]
df = df.sort_values(by=['Station', time_col])

df['Year'] = df[time_col].dt.year
df['Month'] = df[time_col].dt.month
df['Day'] = df[time_col].dt.day
df['Hour'] = df[time_col].dt.hour
df['DayOfYear'] = df[time_col].dt.dayofyear

df['GWL_lag1'] = df.groupby('Station')[target_col].shift(1)
df['GWL_lag2'] = df.groupby('Station')[target_col].shift(2)
df['GWL_lag4'] = df.groupby('Station')[target_col].shift(4)
df['GWL_diff_1'] = df['GWL_lag1'] - df['GWL_lag2']

df['GWL_roll_mean_24h'] = df.groupby('Station')['GWL_lag1'].transform(lambda x: x.rolling(window=4, min_periods=1).mean())
df['GWL_roll_mean_48h'] = df.groupby('Station')['GWL_lag1'].transform(lambda x: x.rolling(window=8, min_periods=1).mean())
df['GWL_roll_std_24h'] = df.groupby('Station')['GWL_lag1'].transform(lambda x: x.rolling(window=4, min_periods=2).std())

stations_summary = []

for raw_st_name, group in df.groupby('Station'):
    st_name = str(raw_st_name).strip()
    last_row = group.iloc[-1]
    code = st_map.get(st_name, 0)
    
    # Feature row for prediction
    f_dict = {
        'Year': int(last_row['Year']),
        'Month': int(last_row['Month']),
        'Day': int(last_row['Day']),
        'Hour': int(last_row['Hour']),
        'DayOfYear': int(last_row['DayOfYear']),
        'GWL_lag1': float(last_row['GWL_lag1']) if pd.notna(last_row['GWL_lag1']) else float(last_row[target_col]),
        'GWL_lag2': float(last_row['GWL_lag2']) if pd.notna(last_row['GWL_lag2']) else float(last_row[target_col]),
        'GWL_lag4': float(last_row['GWL_lag4']) if pd.notna(last_row['GWL_lag4']) else float(last_row[target_col]),
        'GWL_diff_1': float(last_row['GWL_diff_1']) if pd.notna(last_row['GWL_diff_1']) else 0.0,
        'GWL_roll_mean_24h': float(last_row['GWL_roll_mean_24h']) if pd.notna(last_row['GWL_roll_mean_24h']) else float(last_row[target_col]),
        'GWL_roll_mean_48h': float(last_row['GWL_roll_mean_48h']) if pd.notna(last_row['GWL_roll_mean_48h']) else float(last_row[target_col]),
        'GWL_roll_std_24h': float(last_row['GWL_roll_std_24h']) if (pd.notna(last_row['GWL_roll_std_24h']) and not np.isnan(last_row['GWL_roll_std_24h'])) else 0.05,
        'Station_Code': int(code)
    }
    pred_val = predict_row(f_dict)
    curr_val = float(last_row[target_col])
    
    if pred_val < 5.0:
        classification = "Shallow Water Table (High Surface Runoff)"
        status_color = "#ef4444" # red
        status_badge = "danger"
    elif pred_val <= 35.0:
        classification = "Optimal / Normal Range"
        status_color = "#10b981" # green
        status_badge = "success"
    elif pred_val <= 60.0:
        classification = "Moderately Deep Ground Water"
        status_color = "#f59e0b" # amber
        status_badge = "warning"
    else:
        classification = "Deep Water Table (Water Stress)"
        status_color = "#ef4444" # red
        status_badge = "danger"
        
    diff = pred_val - curr_val
    trend_str = f"{'+' if diff >= 0 else ''}{diff:.2f} m"

    stations_summary.append({
        'name': st_name,
        'code': int(code),
        'district': str(last_row.get('District', '')),
        'tehsil': str(last_row.get('Tehsil', '')),
        'block': str(last_row.get('Block', '')),
        'village': str(last_row.get('Village', '')),
        'lat': float(last_row['Latitude']),
        'lng': float(last_row['Longitude']),
        'current_gwl': round(curr_val, 2),
        'predicted_gwl': round(pred_val, 2),
        'difference': round(diff, 2),
        'trend_str': trend_str,
        'classification': classification,
        'status_color': status_color,
        'status_badge': status_badge,
        'last_updated': last_row[time_col].strftime('%Y-%m-%d %H:%M') if hasattr(last_row[time_col], 'strftime') else str(last_row[time_col])
    })

print(f"Processed {len(stations_summary)} stations successfully.")
with open("stations_map_data.json", "w") as f:
    json.dump(stations_summary, f, indent=2)
print("Saved stations_map_data.json")
