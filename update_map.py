import json
import os

notebook_path = "predict.ipynb"
with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Ensure folium and shutil are in the imports
for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        source = cell['source']
        if not any('folium' in line for line in source):
            if not source[-1].endswith('\n'):
                source[-1] = source[-1] + '\n'
            source.append("import folium\nimport shutil\n")
        break

folium_source = [
    "import folium\n",
    "import shutil\n",
    "from IPython.display import display\n",
    "\n",
    "print(\"\\nGenerating interactive telemetry map with Current & Predicted GWL values...\")\n",
    "\n",
    "# Extract latest observed telemetry record for each station\n",
    "latest_df = df.dropna(subset=['Latitude', 'Longitude', target_col, time_col] + [f for f in features if f in df.columns]).sort_values(by=['Station', time_col]).groupby('Station').last().reset_index()\n",
    "\n",
    "if len(latest_df) > 0:\n",
    "    # Generate model predictions for the latest telemetry state\n",
    "    latest_df['Predicted_GWL'] = xgb_model.predict(latest_df[features])\n",
    "    \n",
    "    center_lat = latest_df['Latitude'].mean()\n",
    "    center_lon = latest_df['Longitude'].mean()\n",
    "    \n",
    "    m = folium.Map(location=[center_lat, center_lon], zoom_start=8, tiles='OpenStreetMap')\n",
    "    \n",
    "    # Add custom CSS for tooltips\n",
    "    custom_css = '''\n",
    "    <style>\n",
    "    .custom-tooltip {\n",
    "        background: rgba(15, 23, 42, 0.95) !important;\n",
    "        border: 1px solid rgba(56, 189, 248, 0.4) !important;\n",
    "        border-radius: 8px !important;\n",
    "        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;\n",
    "        padding: 0 !important;\n",
    "        color: #f8fafc !important;\n",
    "        font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;\n",
    "    }\n",
    "    </style>\n",
    "    '''\n",
    "    m.get_root().html.add_child(folium.Element(custom_css))\n",
    "    \n",
    "    # Title banner\n",
    "    title_html = '''\n",
    "    <div style=\"position: fixed; top: 15px; left: 50%; transform: translateX(-50%); z-index: 1000; background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(56, 189, 248, 0.35); padding: 8px 18px; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.35); text-align: center; font-family: sans-serif; pointer-events: none;\">\n",
    "        <div style=\"font-size: 13px; font-weight: 700; color: #38bdf8;\">Meghalaya Telemetry Groundwater Monitoring Map</div>\n",
    "        <div style=\"font-size: 11px; color: #94a3b8;\">Hover cursor over any telemetry station to inspect <b>Current</b> vs <b>Predicted</b> GWL values</div>\n",
    "    </div>\n",
    "    '''\n",
    "    m.get_root().html.add_child(folium.Element(title_html))\n",
    "    \n",
    "    for _, row in latest_df.iterrows():\n",
    "        st_name = str(row['Station']).strip()\n",
    "        district = str(row.get('District', ''))\n",
    "        curr_val = float(row[target_col])\n",
    "        pred_val = float(row['Predicted_GWL'])\n",
    "        diff = pred_val - curr_val\n",
    "        trend_str = f\"{'+' if diff >= 0 else ''}{diff:.2f} m\"\n",
    "        trend_color = '#ef4444' if diff > 0.5 else ('#10b981' if diff < -0.5 else '#38bdf8')\n",
    "        code_val = int(row.get('Station_Code', 0))\n",
    "        last_updated_str = row[time_col].strftime('%Y-%m-%d %H:%M') if hasattr(row[time_col], 'strftime') else str(row[time_col])\n",
    "        \n",
    "        if pred_val < 5.0:\n",
    "            classification = 'Shallow Water Table (High Surface Runoff)'\n",
    "            marker_color = '#ef4444'\n",
    "            badge_bg = 'rgba(239, 68, 68, 0.18)'\n",
    "            badge_text = '#f87171'\n",
    "        elif pred_val <= 35.0:\n",
    "            classification = 'Optimal / Normal Range'\n",
    "            marker_color = '#10b981'\n",
    "            badge_bg = 'rgba(16, 185, 129, 0.18)'\n",
    "            badge_text = '#34d399'\n",
    "        elif pred_val <= 60.0:\n",
    "            classification = 'Moderately Deep Ground Water'\n",
    "            marker_color = '#f59e0b'\n",
    "            badge_bg = 'rgba(245, 158, 11, 0.18)'\n",
    "            badge_text = '#fbbf24'\n",
    "        else:\n",
    "            classification = 'Deep Water Table (Depleted / Water Stress)'\n",
    "            marker_color = '#ef4444'\n",
    "            badge_bg = 'rgba(239, 68, 68, 0.18)'\n",
    "            badge_text = '#f87171'\n",
    "            \n",
    "        tooltip_html = f'''\n",
    "        <div style=\"padding: 10px 14px; min-width: 220px; font-family: sans-serif; line-height: 1.4; color: #f8fafc;\">\n",
    "            <div style=\"display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 6px;\">\n",
    "                <div style=\"font-size: 14px; font-weight: 700; color: #38bdf8;\">📍 {st_name}</div>\n",
    "                <span style=\"font-size: 10px; font-weight: 600; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border-radius: 4px; padding: 1px 6px;\">Code: {code_val}</span>\n",
    "            </div>\n",
    "            {f'<div style=\"font-size: 11px; color: #94a3b8; margin-bottom: 8px;\">District: <span style=\"color: #cbd5e1; font-weight: 600;\">{district}</span></div>' if district and district != 'nan' else ''}\n",
    "            <div style=\"background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 8px 10px; margin-bottom: 8px;\">\n",
    "                <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;\">\n",
    "                    <span style=\"font-size: 11px; color: #94a3b8;\">Current Observed GWL:</span>\n",
    "                    <span style=\"font-size: 13px; font-weight: 700; color: #38bdf8;\">{curr_val:.2f} m</span>\n",
    "                </div>\n",
    "                <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;\">\n",
    "                    <span style=\"font-size: 11px; color: #94a3b8;\">Predicted GWL (Model):</span>\n",
    "                    <span style=\"font-size: 13px; font-weight: 700; color: #34d399;\">{pred_val:.2f} m</span>\n",
    "                </div>\n",
    "                <div style=\"display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 4px; margin-top: 2px;\">\n",
    "                    <span style=\"font-size: 10px; color: #64748b;\">Telemetry Variance:</span>\n",
    "                    <span style=\"font-size: 11px; font-weight: 600; color: {trend_color};\">{trend_str}</span>\n",
    "                </div>\n",
    "            </div>\n",
    "            <div style=\"margin-bottom: 6px;\">\n",
    "                <span style=\"display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: {badge_bg}; color: {badge_text};\">\n",
    "                    {classification}\n",
    "                </span>\n",
    "            </div>\n",
    "            <div style=\"font-size: 9.5px; color: #64748b; margin-top: 4px; display: flex; justify-content: space-between;\">\n",
    "                <span>Depth to water table</span>\n",
    "                <span>Sync: {last_updated_str}</span>\n",
    "            </div>\n",
    "        </div>\n",
    "        '''\n",
    "        \n",
    "        folium.CircleMarker(\n",
    "            location=[row['Latitude'], row['Longitude']],\n",
    "            radius=9,\n",
    "            color='#ffffff',\n",
    "            weight=2,\n",
    "            fill=True,\n",
    "            fill_color=marker_color,\n",
    "            fill_opacity=0.88,\n",
    "            tooltip=folium.Tooltip(tooltip_html, sticky=True, class_name='custom-tooltip'),\n",
    "            popup=folium.Popup(tooltip_html, max_width=280)\n",
    "        ).add_to(m)\n",
    "        \n",
    "    m.fit_bounds(latest_df[['Latitude', 'Longitude']].agg(['min', 'max']).values.tolist())\n",
    "    map_path = 'water_wells_map.html'\n",
    "    m.save(map_path)\n",
    "    print(f\"Interactive map saved to: {map_path}\")\n",
    "    \n",
    "    # Copy to frontend and backend targets for Vercel\n",
    "    for dst in ['frontend/public/water_wells_map.html', 'frontend/dist/water_wells_map.html', 'groundwater_prediction/static/water_wells_map.html', 'groundwater_prediction/templates/water_wells_map.html']:\n",
    "        if os.path.exists(os.path.dirname(dst)):\n",
    "            shutil.copyfile(map_path, dst)\n",
    "            print(f\"Synced map to: {dst}\")\n",
    "            \n",
    "    display(m)\n",
    "else:\n",
    "    print(\"Warning: Could not generate map. Latitude/Longitude columns may be missing or empty.\")\n"
]

# Update the map cell in notebook (cell index 4 or last cell)
for idx, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code' and any('folium' in line or 'water_wells_map' in line for line in cell['source']):
        nb['cells'][idx]['source'] = folium_source
        break
else:
    nb['cells'][-1]['source'] = folium_source

with open(notebook_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("predict.ipynb and update_map.py updated with Current & Predicted values successfully.")
