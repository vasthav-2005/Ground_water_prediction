import json

notebook_path = "predict.ipynb"
with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Ensure plotly is in the imports
for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        source = cell['source']
        if not any('plotly.express' in line for line in source):
            if not source[-1].endswith('\n'):
                source[-1] = source[-1] + '\n'
            source.append("import plotly.express as px\n")
        break

# The new map source using Plotly Express
plotly_source = [
    "print(\"\\nGenerating interactive water well locations map...\")\n",
    "# Get unique stations with their coordinates\n",
    "stations_df = df.dropna(subset=['Latitude', 'Longitude'])[['Station', 'Latitude', 'Longitude']].drop_duplicates(subset=['Station'])\n",
    "\n",
    "if len(stations_df) > 0:\n",
    "    # Create an interactive map using Plotly Express\n",
    "    fig = px.scatter_mapbox(\n",
    "        stations_df, \n",
    "        lat=\"Latitude\", \n",
    "        lon=\"Longitude\", \n",
    "        hover_name=\"Station\",\n",
    "        color_discrete_sequence=[\"blue\"], \n",
    "        zoom=7, \n",
    "        height=600\n",
    "    )\n",
    "    \n",
    "    # Use OpenStreetMap tiles (no API key required)\n",
    "    fig.update_layout(mapbox_style=\"open-street-map\")\n",
    "    fig.update_layout(margin={\"r\":0,\"t\":40,\"l\":0,\"b\":0}, title=\"Water Well Locations (Meghalaya)\")\n",
    "    \n",
    "    # Display directly in the notebook output natively\n",
    "    fig.show()\n",
    "else:\n",
    "    print(\"Warning: Could not generate map. Latitude/Longitude columns may be missing or empty.\")"
]

# Replace the last cell (which was the folium code) with the new plotly code
nb['cells'][-1]['source'] = plotly_source

with open(notebook_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Notebook updated to use Plotly for native VS Code rendering.")
