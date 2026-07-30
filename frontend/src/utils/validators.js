export const validatePredictionForm = (values) => {
  const errors = {};

  if (!values.station) {
    errors.station = 'Please select a telemetry station';
  }

  if (values.month === '' || values.month === null || values.month === undefined) {
    errors.month = 'Month is required';
  } else {
    const m = parseInt(values.month, 10);
    if (isNaN(m) || m < 1 || m > 12) {
      errors.month = 'Please select a valid month (January – December)';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
