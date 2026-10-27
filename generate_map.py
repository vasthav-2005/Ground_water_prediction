import os
import json
import shutil
import folium

# 1. Load precomputed station data
json_path = 'stations_map_data.json'
with open(json_path, 'r', encoding='utf-8') as f:
    stations = json.load(f)

# Calculate center
lats = [s['lat'] for s in stations]
lngs = [s['lng'] for s in stations]
center_lat = sum(lats) / len(lats)
center_lng = sum(lngs) / len(lngs)

# Create Folium Map with clean OpenStreetMap tiles
m = folium.Map(
    location=[center_lat, center_lng],
    zoom_start=8,
    tiles='OpenStreetMap'
)

# Custom CSS for modern styling and tooltips
custom_css = """
<style>
.custom-tooltip {
    background: rgba(15, 23, 42, 0.95) !important;
    border: 1px solid rgba(56, 189, 248, 0.4) !important;
    border-radius: 8px !important;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5) !important;
    padding: 0 !important;
    color: #f8fafc !important;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
}
.leaflet-tooltip-left:before, .leaflet-tooltip-right:before {
    border-right-color: rgba(15, 23, 42, 0.95) !important;
    border-left-color: rgba(15, 23, 42, 0.95) !important;
}
.leaflet-popup-content-wrapper {
    background: #0f172a !important;
    color: #f8fafc !important;
    border: 1px solid rgba(56, 189, 248, 0.4) !important;
    border-radius: 8px !important;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
}
.leaflet-popup-tip {
    background: #0f172a !important;
}
.station-marker-circle {
    transition: all 0.2s ease-in-out;
}
.station-marker-circle:hover {
    stroke-width: 3.5px !important;
    stroke: #ffffff !important;
}
</style>
"""
m.get_root().html.add_child(folium.Element(custom_css))

# Add Header Title Banner
title_html = """
<div style="
    position: fixed;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: rgba(15, 23, 42, 0.92);
    border: 1px solid rgba(56, 189, 248, 0.35);
    backdrop-filter: blur(8px);
    padding: 8px 18px;
    border-radius: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.35);
    text-align: center;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    pointer-events: none;
">
    <div style="font-size: 13px; font-weight: 700; color: #38bdf8; display: flex; align-items: center; justify-content: center; gap: 6px;">
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; box-shadow:0 0 8px #10b981;"></span>
        Meghalaya Telemetry Groundwater Monitoring Map
    </div>
    <div style="font-size: 11px; color: #94a3b8; margin-top: 1px;">
        Hover over any telemetry station to inspect <b>Current</b> vs <b>Predicted</b> GWL values
    </div>
</div>
"""
m.get_root().html.add_child(folium.Element(title_html))

# Add Legend Box
legend_html = """
<div style="
    position: fixed;
    bottom: 25px;
    right: 15px;
    z-index: 1000;
    background: rgba(15, 23, 42, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(8px);
    padding: 10px 14px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 11px;
    color: #e2e8f0;
    max-width: 220px;
">
    <div style="font-weight: 700; color: #38bdf8; margin-bottom: 6px; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
        💧 GWL Status Key
    </div>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#10b981;"></span>
        <span>Optimal / Normal (&le; 35m)</span>
    </div>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#f59e0b;"></span>
        <span>Moderately Deep (35 - 60m)</span>
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#ef4444;"></span>
        <span>Shallow / Critical Runoff (&lt; 5m)</span>
    </div>
</div>
"""
m.get_root().html.add_child(folium.Element(legend_html))

# Iterate and add interactive circle markers
for st in stations:
    name = st['name']
    code = st['code']
    district = st.get('district', '')
    curr_val = st['current_gwl']
    pred_val = st['predicted_gwl']
    diff = st.get('difference', round(pred_val - curr_val, 2))
    trend_sign = '+' if diff >= 0 else ''
    trend_str = f"{trend_sign}{diff:.2f} m"
    trend_color = '#ef4444' if diff > 0.5 else ('#10b981' if diff < -0.5 else '#38bdf8')
    last_upd = st.get('last_updated', '2025-05-21 18:00')
    classification = st.get('classification', 'Optimal / Normal Range')
    status_color = st.get('status_color', '#0284c7')
    
    # Background badge color based on classification
    if 'Optimal' in classification:
        badge_bg = 'rgba(16, 185, 129, 0.18)'
        badge_border = 'rgba(16, 185, 129, 0.45)'
        badge_text = '#34d399'
        marker_color = '#10b981'
    elif 'Moderately' in classification:
        badge_bg = 'rgba(245, 158, 11, 0.18)'
        badge_border = 'rgba(245, 158, 11, 0.45)'
        badge_text = '#fbbf24'
        marker_color = '#f59e0b'
    else:
        badge_bg = 'rgba(239, 68, 68, 0.18)'
        badge_border = 'rgba(239, 68, 68, 0.45)'
        badge_text = '#f87171'
        marker_color = '#ef4444'

    content_html = f"""
    <div style="padding: 10px 14px; min-width: 220px; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; line-height: 1.4; color: #f8fafc;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 6px;">
            <div style="font-size: 14px; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 4px;">
                <span>📍</span> {name}
            </div>
            <span style="font-size: 10px; font-weight: 600; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 4px; padding: 1px 6px;">
                Code: {code}
            </span>
        </div>
        
        {f'<div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">District: <span style="color: #cbd5e1; font-weight: 600;">{district}</span></div>' if district else ''}

        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 8px 10px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <span style="font-size: 11px; color: #94a3b8; font-weight: 500;">Current Observed GWL:</span>
                <span style="font-size: 13px; font-weight: 700; color: #38bdf8;">{curr_val:.2f} m</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <span style="font-size: 11px; color: #94a3b8; font-weight: 500;">Predicted GWL (Model):</span>
                <span style="font-size: 13px; font-weight: 700; color: #34d399;">{pred_val:.2f} m</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 4px; margin-top: 2px;">
                <span style="font-size: 10px; color: #64748b;">Telemetry Variance:</span>
                <span style="font-size: 11px; font-weight: 600; color: {trend_color};">{trend_str}</span>
            </div>
        </div>

        <div style="margin-bottom: 6px;">
            <span style="display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: {badge_bg}; color: {badge_text}; border: 1px solid {badge_border};">
                {classification}
            </span>
        </div>

        <div style="font-size: 9.5px; color: #64748b; margin-top: 4px; display: flex; justify-content: space-between;">
            <span>Depth to water table</span>
            <span>Sync: {last_upd}</span>
        </div>
    </div>
    """

    folium.CircleMarker(
        location=[st['lat'], st['lng']],
        radius=9,
        color='#ffffff',
        weight=2,
        fill=True,
        fill_color=marker_color,
        fill_opacity=0.88,
        tooltip=folium.Tooltip(content_html, sticky=True, class_name='custom-tooltip'),
        popup=folium.Popup(content_html, max_width=280)
    ).add_to(m)

# Fit bounds to encompass all stations
m.fit_bounds([[min(lats), min(lngs)], [max(lats), max(lngs)]])

output_file = 'water_wells_map.html'
m.save(output_file)
print(f"Generated {output_file} successfully.")

# Copy to all application locations for Vercel and local usage
destinations = [
    'frontend/public/water_wells_map.html',
    'frontend/dist/water_wells_map.html',
    'groundwater_prediction/static/water_wells_map.html',
    'groundwater_prediction/templates/water_wells_map.html'
]

for dst in destinations:
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copyfile(output_file, dst)
    print(f"Copied to: {dst}")

print("All map files successfully generated and distributed!")
