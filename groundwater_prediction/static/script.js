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

    } catch (err) {
      showError('Network error connecting to Flask prediction engine: ' + err.message);
    } finally {
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    }
  });
});

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
  hideError();
}

// Reset Form
function resetForm() {
  document.getElementById('predictionForm').reset();
  document.getElementById('stationCode').value = '14';
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
