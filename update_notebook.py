import json

notebook_path = r"D:\GW Prediction\predict.ipynb"
with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Add matplotlib import to the first code cell
for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        source = cell['source']
        if not any('matplotlib' in line for line in source):
            if not source[-1].endswith('\n'):
                source[-1] = source[-1] + '\n'
            source.append("import matplotlib.pyplot as plt\n")
        break

# Create the map cell
map_source = [
    "print(\"\\nGenerating water well locations map...\")\n",
    "# Get unique stations with their coordinates\n",
    "stations_df = df.dropna(subset=['Latitude', 'Longitude'])[['Station', 'Latitude', 'Longitude']].drop_duplicates(subset=['Station'])\n",
    "\n",
    "if len(stations_df) > 0:\n",
    "    plt.figure(figsize=(12, 8))\n",
    "    \n",
    "    # Plot the wells\n",
    "    plt.scatter(stations_df['Longitude'], stations_df['Latitude'], \n",
    "                color='#1f77b4', marker='o', edgecolor='black', s=100, alpha=0.8, zorder=5)\n",
    "    \n",
    "    # Add station names as text labels\n",
    "    for idx, row in stations_df.iterrows():\n",
    "        plt.text(row['Longitude'] + 0.005, row['Latitude'] + 0.005, \n",
    "                 str(row['Station']), fontsize=9, zorder=10,\n",
    "                 bbox=dict(facecolor='white', alpha=0.6, edgecolor='none', pad=1))\n",
    "        \n",
    "    plt.title('Water Well Locations (Meghalaya Dataset)', fontsize=18, pad=20)\n",
    "    plt.xlabel('Longitude', fontsize=14)\n",
    "    plt.ylabel('Latitude', fontsize=14)\n",
    "    plt.grid(True, linestyle='--', alpha=0.5, zorder=0)\n",
    "    plt.gca().set_facecolor('#f4f4f4')\n",
    "    \n",
    "    plt.tight_layout()\n",
    "    map_path = r\"D:\\GW Prediction\\water_wells_map.png\"\n",
    "    plt.savefig(map_path, dpi=300, bbox_inches='tight')\n",
    "    \n",
    "    print(f\"Map successfully generated and saved to: {map_path}\")\n",
    "    plt.show()\n",
    "else:\n",
    "    print(\"Warning: Could not generate map. Latitude/Longitude columns may be missing or empty.\")"
]

map_cell = {
    "cell_type": "code",
    "execution_count": None,
    "metadata": {},
    "outputs": [],
    "source": map_source
}

nb['cells'].append(map_cell)

with open(notebook_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Notebook updated successfully.")
