export const formatTimeDisplay = (time) => {
  if (!time) return '';
  const [hourStr = '', minuteStr = ''] = time.split(':');
  const hour = Number.parseInt(hourStr, 10);
  const minute = Number.parseInt(minuteStr, 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return time;
  }
  const period = hour >= 12 ? 'PM' : 'AM';
  const normalizedHour = ((hour + 11) % 12) + 1;
  return `${normalizedHour}:${minute.toString().padStart(2, '0')} ${period}`;
};

export const formatTimeRange = (start, end) => {
  if (!start || !end) return '';
  return `${formatTimeDisplay(start)} - ${formatTimeDisplay(end)}`;
};

export const parseMeridiemTime = (input) => {
  if (!input) return null;
  const normalized = input
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
  const match = normalized.match(/^(\d{1,2})(?::?(\d{2}))?\s*(AM|PM)$/);
  if (!match) return null;
  let hour = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2] ?? '00', 10);
  if (Number.isNaN(hour) || Number.isNaN(minute) || minute > 59 || hour < 1 || hour > 12) {
    return null;
  }
  const period = match[3];
  if (period === 'AM') {
    if (hour === 12) hour = 0;
  } else if (hour !== 12) {
    hour += 12;
  }
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};
