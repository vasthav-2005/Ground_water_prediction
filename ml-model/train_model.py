import os
import json
import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib

def train_and_save():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "..", "gwl_tel_6_hourly_meghalaya_ml_2021_2025.csv")
    
    if not os.path.exists(data_path):
        data_path = os.path.abspath("gwl_tel_6_hourly_meghalaya_ml_2021_2025.csv")
        
    print(f"Loading data from: {data_path}")
    df = pd.read_csv(data_path)

    time_col = 'Data Acquisition Time'
    target_col = 'Groundwater Level Telemetry 6 Hourly (meter)'

    df[time_col] = pd.to_datetime(df[time_col], format='%d-%m-%Y %H:%M', errors='coerce')
    df = df.dropna(subset=[time_col, target_col])
    df = df[(df[target_col] >= -50) & (df[target_col] < 150)]
    df = df.sort_values(by=['Station', time_col])

    # Feature Engineering: Temporal features
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

    df = df.dropna(subset=['GWL_lag1', 'GWL_lag2', 'GWL_lag4', 'GWL_diff_1', 'GWL_roll_mean_24h', 'GWL_roll_std_24h'])

    features = [
        'Year', 'Month', 'Day', 'Hour', 'DayOfYear', 
        'GWL_lag1', 'GWL_lag2', 'GWL_lag4', 
        'GWL_diff_1', 'GWL_roll_mean_24h', 'GWL_roll_mean_48h', 'GWL_roll_std_24h'
    ]

    # Map station names to codes
    stations = sorted(list(df['Station'].unique()))
    station_map = {st.strip(): idx for idx, st in enumerate(stations)}
    station_code_to_name = {idx: st.strip() for idx, st in enumerate(stations)}

    df['Station_Clean'] = df['Station'].str.strip()
    df['Station_Code'] = df['Station_Clean'].map(station_map)
    features.append('Station_Code')

    X = df[features]
    y = df[target_col]

    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    print(f"Training set shape: {X_train.shape}, Test set shape: {X_test.shape}")

    xgb_model = XGBRegressor(
        n_estimators=300, 
        learning_rate=0.05, 
        max_depth=6, 
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=0.1,
        reg_lambda=1.0, 
        random_state=42, 
        n_jobs=-1
    )
    xgb_model.fit(X_train, y_train)

    predictions = xgb_model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))

    print(f"Model Training Complete!")
    print(f"Mean Absolute Error (MAE): {mae:.4f} meters")
    print(f"Root Mean Squared Error (RMSE): {rmse:.4f} meters")

    # Output directory
    out_dir = os.path.dirname(os.path.abspath(__file__))
    model_file = os.path.join(out_dir, "groundwater_model.joblib")
    meta_file = os.path.join(out_dir, "stations.json")
    model_meta_file = os.path.join(out_dir, "model_meta.json")

    joblib.dump(xgb_model, model_file)
    print(f"Saved model to: {model_file}")

    station_list = [{"code": code, "name": name} for code, name in station_code_to_name.items()]
    with open(meta_file, "w") as f:
        json.dump({"stations": station_list, "station_map": station_map}, f, indent=2)
    print(f"Saved station metadata to: {meta_file}")

    meta = {
        "features": features,
        "target": target_col,
        "mae": round(float(mae), 4),
        "rmse": round(float(rmse), 4),
        "num_samples": len(df),
        "num_stations": len(stations)
    }
    with open(model_meta_file, "w") as f:
        json.dump(meta, f, indent=2)
    print(f"Saved model metadata to: {model_meta_file}")

if __name__ == "__main__":
    train_and_save()
