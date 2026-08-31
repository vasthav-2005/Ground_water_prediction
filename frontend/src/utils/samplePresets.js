export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Computes the 4 rolling relative months based on the current system date in IST (Asia/Kolkata).
 * Month 1 = Current Month
 * Month 2 = Next Month
 * Month 3 = Month After Next
 * Month 4 = Fourth Month
 */
export const getRollingMonths = () => {
  const now = new Date();
  // IST Timezone offset (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istDate = new Date(utc + istOffset);

  const currentYear = istDate.getFullYear();
  const currentMonthIdx = istDate.getMonth(); // 0-indexed (0..11)

  const rolling = [];

  for (let offset = 0; offset < 12; offset++) {
    const totalMonthIdx = currentMonthIdx + offset;
    const actualMonthNumber = (totalMonthIdx % 12) + 1; // 1..12
    const targetYear = currentYear + Math.floor(totalMonthIdx / 12);
    const monthName = MONTH_NAMES[actualMonthNumber - 1];

    const label = `${monthName} (Month ${offset + 1})`;

    rolling.push({
      relativeIndex: offset + 1,
      actualMonth: actualMonthNumber,
      year: targetYear,
      monthName: monthName,
      label: label,
      shortLabel: label
    });
  }

  return rolling;
};

export const getMonthName = (monthNum) => {
  return MONTH_NAMES[(monthNum - 1) % 12] || `Month ${monthNum}`;
};

export const getSamplePresets = () => {
  const rolling = getRollingMonths();
  const m1 = rolling[0];
  const m2 = rolling[1];
  const m3 = rolling[2];
  const m4 = rolling[3];

  return [
    {
      id: 'shillong-m1',
      name: `Shillong (${m1.shortLabel})`,
      station: 'Shillong',
      stationCode: 14,
      month: m1.actualMonth,
      year: m1.year,
      relativeIndex: 1
    },
    {
      id: 'jowai-m2',
      name: `Jowai (${m2.shortLabel})`,
      station: 'Jowai',
      stationCode: 4,
      month: m2.actualMonth,
      year: m2.year,
      relativeIndex: 2
    },
    {
      id: 'nongstoin-m3',
      name: `Nongstoin (${m3.shortLabel})`,
      station: 'Nongstoin_1',
      stationCode: 9,
      month: m3.actualMonth,
      year: m3.year,
      relativeIndex: 3
    },
    {
      id: 'baghmara-m4',
      name: `Barengapara (${m4.shortLabel})`,
      station: 'Barengapara',
      stationCode: 1,
      month: m4.actualMonth,
      year: m4.year,
      relativeIndex: 4
    }
  ];
};
