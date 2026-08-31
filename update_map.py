import json

notebook_path = "predict.ipynb"
with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Ensure folium is in the imports
for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        source = cell['source']
        if not any('folium' in line for line in source):
            if not source[-1].endswith('\n'):
                source[-1] = source[-1] + '\n'
            source.append("import folium\n")
        break

# The new map source using Folium
folium_source = [
    "print(\"\\nGenerating interactive water well locations map with observed GWL values...\")\n",
    "latest_df = df.dropna(subset=['Latitude', 'Longitude', target_col, time_col]).sort_values(by=['Station', time_col]).groupby('Station').last().reset_index()\n",
    "\n",
    "if len(latest_df) > 0:\n",
    "    center_lat = latest_df['Latitude'].mean()\n",
    "    center_lon = latest_df['Longitude'].mean()\n",
    "    \n",
    "    m = folium.Map(location=[center_lat, center_lon], zoom_start=8, tiles='OpenStreetMap')\n",
    "    \n",
    "    for idx, row in latest_df.iterrows():\n",
    "        st_name = row['Station']\n",
    "        gwl_val = float(row[target_col])\n",
    "        obs_time = row[time_col].strftime('%d-%b-%Y') if hasattr(row[time_col], 'strftime') else str(row[time_col])\n",
    "        tooltip_text = f\"\"\"\n",
    "        <div style=\"font-family: Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #0f172a; padding: 2px;\">\n",
    "            <div style=\"font-size: 13px; font-weight: 700; color: #0284c7; margin-bottom: 2px;\">\n",
    "                Station: {st_name}\n",
    "            </div>\n",
    "            <div style=\"font-weight: 600;\">\n",
    "                Current Groundwater Level: <span style=\"color: #0284c7;\">{gwl_val:.2f} m</span>\n",
    "            </div>\n",
    "            <div style=\"font-size: 11px; color: #64748b; margin-top: 1px;\">\n",
    "                Depth to Water Table ({obs_time})\n",
    "            </div>\n",
    "        </div>\n",
    "        \"\"\"\n",
    "        folium.CircleMarker(\n",
    "            location=[row['Latitude'], row['Longitude']],\n",
    "            radius=8,\n",
    "            color='#0f172a',\n",
    "            weight=1.5,\n",
    "            fill=True,\n",
    "            fill_color='#0284c7',\n",
    "            fill_opacity=0.85,\n",
    "            tooltip=folium.Tooltip(tooltip_text, sticky=True),\n",
    "            popup=folium.Popup(tooltip_text, max_width=250)\n",
    "        ).add_to(m)\n",
    "        \n",
    "    map_path = \"water_wells_map.html\"\n",
    "    m.save(map_path)\n",
    "    print(f\"Interactive map saved to: {map_path}\")\n",
    "    display(m)\n",
    "else:\n",
    "    print(\"Warning: Could not generate map. Latitude/Longitude columns may be missing or empty.\")"
]

# Replace the last cell (which was the matplotlib code) with the new folium code
nb['cells'][-1]['source'] = folium_source

with open(notebook_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Notebook updated to use an actual map (Folium) successfully.")
