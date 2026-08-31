const PRESETS = {
  shillong: { station: 'Shillong', stationCode: 14, month: 7 },
  cherrapunji: { station: 'Cherrapunji', stationCode: 2, month: 11 },
  jowai: { station: 'Jowai', stationCode: 4, month: 3 },
  tura: { station: 'Tura', stationCode: 16, month: 5 }
};

const MONTH_NAMES = {
  1: 'January', 2: 'February', 3: 'March', 4: 'April',
  5: 'May', 6: 'June', 7: 'July', 8: 'August',
  9: 'September', 10: 'October', 11: 'November', 12: 'December'
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('predictionForm');
  const stationSelect = document.getElementById('station');
  const stationCodeInput = document.getElementById('stationCode');

  // Sync Station Code hidden input
  stationSelect.addEventListener('change', () => {
    const selectedOption = stationSelect.options[stationSelect.selectedIndex];
    const code = selectedOption.getAttribute('data-code') || '0';
    stationCodeInput.value = code;
  });

  // Form submit AJAX listener
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const submitBtn = document.getElementById('btnSubmit');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Predicting...';
    submitBtn.disabled = true;

    try {
      const formData = new FormData(form);
      const payload = {};
      formData.forEach((value, key) => {
        payload[key] = value;
      });

      const response = await fetch('/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || result.status === 'error') {
        showError(result.message || 'Error occurred during prediction computation.');
      } else {
        updatePredictionResultUI(result);
      }

const ALL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getISTRollingMonths() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istDate = new Date(utc + istOffset);

  const currentYear = istDate.getFullYear();
  const currentMonthIdx = istDate.getMonth(); // 0..11

  const rolling = [];
  for (let offset = 0; offset < 4; offset++) {
    const totalIdx = currentMonthIdx + offset;
    const actualMonthNum = (totalIdx % 12) + 1; // 1..12
    const targetYear = currentYear + Math.floor(totalIdx / 12);
    const monthName = ALL_MONTH_NAMES[actualMonthNum - 1];

    let suffix = `Month ${offset + 1}`;
    if (offset === 0) suffix += ' – Current Month';
    else if (offset === 1) suffix += ' – Next Month';

    rolling.push({
      relativeIndex: offset + 1,
      actualMonth: actualMonthNum,
      year: targetYear,
      monthName: monthName,
      label: `${monthName} (${suffix})`
    });
  }
  return rolling;
}

const STATIONS_COORDS = [
  { name: 'Amlarem', code: 0, lat: 25.285278, lng: 92.103056 },
  { name: 'Barengapara', code: 1, lat: 25.201033, lng: 90.310283 },
  { name: 'Byrnihat', code: 2, lat: 26.077500, lng: 91.875556 },
  { name: 'Damas_1', code: 3, lat: 25.938192, lng: 90.727392 },
  { name: 'Jowai', code: 4, lat: 25.436389, lng: 92.193889 },
  { name: 'Khliehriat', code: 5, lat: 25.344722, lng: 92.366111 },
  { name: 'Latyrke', code: 6, lat: 25.343333, lng: 92.458611 },
  { name: 'Mairang', code: 7, lat: 25.558600, lng: 91.625750 },
  { name: 'Mawkyrwat_1', code: 8, lat: 25.371642, lng: 91.481808 },
  { name: 'Nongstoin_1', code: 9, lat: 25.544931, lng: 91.238681 },
  { name: 'Panchiring', code: 10, lat: 25.202250, lng: 91.318917 },
  { name: 'Phulbari_1', code: 11, lat: 25.877194, lng: 90.029719 },
  { name: 'Rongjeng_1', code: 12, lat: 25.610172, lng: 90.731239 },
  { name: 'Saiden', code: 13, lat: 25.884444, lng: 91.882222 },
  { name: 'Shillong', code: 14, lat: 25.582778, lng: 91.886944 },
  { name: 'Soksan', code: 15, lat: 25.898100, lng: 90.642533 },
  { name: 'Williamnagar', code: 16, lat: 25.508500, lng: 90.604389 },
  { name: 'Zikzak_1', code: 17, lat: 25.376111, lng: 89.885556 }
];

let flaskMapInstance = null;
let flaskMarkers = {};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('predictionForm');
  const stationSelect = document.getElementById('station');
  const stationCodeInput = document.getElementById('stationCode');
  const monthSelect = document.getElementById('month');
  const yearInput = document.getElementById('year');

  // Populate rolling 4 months
  const rolling = getISTRollingMonths();
  if (monthSelect) {
    monthSelect.innerHTML = '';
    rolling.forEach((m, idx) => {
      const opt = document.createElement('option');
      opt.value = m.actualMonth;
      opt.setAttribute('data-year', m.year);
      opt.setAttribute('data-rel', m.relativeIndex);
      opt.innerText = m.label;
      if (idx === 0) {
        opt.selected = true;
        if (yearInput) yearInput.value = m.year;
      }
      monthSelect.appendChild(opt);
    });

    monthSelect.addEventListener('change', () => {
      const selectedOption = monthSelect.options[monthSelect.selectedIndex];
      if (selectedOption && yearInput) {
        yearInput.value = selectedOption.getAttribute('data-year');
      }
    });
  }

  // Initialize Flask Leaflet Map
  initFlaskMap();

  // Sync Station Code hidden input & map focus
  if (stationSelect) {
    stationSelect.addEventListener('change', () => {
      const selectedOption = stationSelect.options[stationSelect.selectedIndex];
      const code = selectedOption.getAttribute('data-code') || '0';
      stationCodeInput.value = code;
      focusStationOnMap(selectedOption.value);
    });
  }

  // Form submit AJAX listener
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const submitBtn = document.getElementById('btnSubmit');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Predicting...';
    submitBtn.disabled = true;

    try {
      const formData = new FormData(form);
      const payload = {};
      formData.forEach((value, key) => {
        payload[key] = value;
      });

      const response = await fetch('/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || result.status === 'error') {
        showError(result.message || 'Error occurred during prediction computation.');
      } else {
        updatePredictionResultUI(result);
      }

    } catch (err) {
      showError('Network error connecting to Flask prediction engine: ' + err.message);
    } finally {
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    }
  });
});

function initFlaskMap() {
  const mapEl = document.getElementById('flaskMap');
  if (!mapEl || typeof L === 'undefined') return;

  flaskMapInstance = L.map('flaskMap', {
    center: [25.55, 91.30],
    zoom: 8
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(flaskMapInstance);

  STATIONS_COORDS.forEach(st => {
    const marker = L.circleMarker([st.lat, st.lng], {
      radius: 9,
      fillColor: '#0284c7',
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(flaskMapInstance);

    marker.bindPopup(`
      <div style="font-family: sans-serif; padding: 2px;">
        <strong style="color:#0284c7;">📍 ${st.name}</strong><br>
        <span style="font-size:0.8rem; color:#475569;">Station Code: ${st.code}</span>
      </div>
    `);

    marker.on('click', () => {
      const stationSelect = document.getElementById('station');
      for (let i = 0; i < stationSelect.options.length; i++) {
        if (stationSelect.options[i].value === st.name) {
          stationSelect.selectedIndex = i;
          document.getElementById('stationCode').value = st.code;
          break;
        }
      }
    });

    flaskMarkers[st.name] = marker;
  });
}

function focusStationOnMap(stationName) {
  if (!flaskMapInstance) return;
  const st = STATIONS_COORDS.find(s => s.name === stationName);
  if (st) {
    flaskMapInstance.flyTo([st.lat, st.lng], 11);
    if (flaskMarkers[st.name]) {
      flaskMarkers[st.name].openPopup();
    }
  }
}

// Load Preset Scenario
function loadPreset(presetKey) {
  const p = PRESETS[presetKey];
  if (!p) return;

  const stationSelect = document.getElementById('station');
  for (let i = 0; i < stationSelect.options.length; i++) {
    if (stationSelect.options[i].value === p.station) {
      stationSelect.selectedIndex = i;
      break;
    }
  }

  document.getElementById('stationCode').value = p.stationCode;
  document.getElementById('month').value = p.month;
  focusStationOnMap(p.station);
  hideError();
}

// Reset Form
function resetForm() {
  document.getElementById('predictionForm').reset();
  document.getElementById('stationCode').value = '14';
  focusStationOnMap('Shillong');
  hideError();
}

// Update Result Card UI
function updatePredictionResultUI(res) {
  const valDisplay = document.getElementById('predictedValDisplay');
  const pillDisplay = document.getElementById('statusPillDisplay');
  const statusText = document.getElementById('statusText');

  valDisplay.innerText = res.predicted_gwl_meter.toFixed(2);
  statusText.innerText = res.classification;

  pillDisplay.className = 'status-pill ' + (res.status_class || 'success');

  // Update feature vector breakdown
  if (res.inputs_evaluated) {
    const inp = res.inputs_evaluated;
    document.getElementById('resStation').innerText = res.station;
    const mName = MONTH_NAMES[inp.Month] || `Month ${inp.Month}`;
    document.getElementById('resMonth').innerText = mName;
  }

  if (res.station) {
    focusStationOnMap(res.station);
  }
}

// Error Alerts Helper
function showError(msg) {
  const alertBox = document.getElementById('errorAlert');
  const alertText = document.getElementById('errorMessageText');
  alertText.innerText = msg;
  alertBox.classList.remove('d-none');
  alertBox.classList.add('d-flex');
}

function hideError() {
  const alertBox = document.getElementById('errorAlert');
  alertBox.classList.remove('d-flex');
  alertBox.classList.add('d-none');
}
