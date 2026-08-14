import json

notebook_path = r"D:\GW Prediction\predict.ipynb"
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
    "print(\"\\nGenerating interactive water well locations map...\")\n",
    "# Get unique stations with their coordinates\n",
    "stations_df = df.dropna(subset=['Latitude', 'Longitude'])[['Station', 'Latitude', 'Longitude']].drop_duplicates(subset=['Station'])\n",
    "\n",
    "if len(stations_df) > 0:\n",
    "    # Calculate center of the map\n",
    "    center_lat = stations_df['Latitude'].mean()\n",
    "    center_lon = stations_df['Longitude'].mean()\n",
    "    \n",
    "    # Create a Folium map centered on the wells with an actual geographic map (OpenStreetMap)\n",
    "    m = folium.Map(location=[center_lat, center_lon], zoom_start=8, tiles='OpenStreetMap')\n",
    "    \n",
    "    # Add markers for each well\n",
    "    for idx, row in stations_df.iterrows():\n",
    "        folium.Marker(\n",
    "            location=[row['Latitude'], row['Longitude']],\n",
    "            tooltip=str(row['Station']),\n",
    "            popup=f\"Station: {row['Station']}\",\n",
    "            icon=folium.Icon(color='blue', icon='tint')\n",
    "        ).add_to(m)\n",
    "        \n",
    "    map_path = r\"D:\\GW Prediction\\water_wells_map.html\"\n",
    "    m.save(map_path)\n",
    "    print(f\"Interactive map saved to: {map_path}\")\n",
    "    \n",
    "    # Display the map directly inside the Jupyter notebook\n",
    "    display(m)\n",
    "else:\n",
    "    print(\"Warning: Could not generate map. Latitude/Longitude columns may be missing or empty.\")"
]

# Replace the last cell (which was the matplotlib code) with the new folium code
nb['cells'][-1]['source'] = folium_source

with open(notebook_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Notebook updated to use an actual map (Folium) successfully.")
