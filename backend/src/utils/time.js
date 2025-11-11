export const formatTimeToMeridiem = (time) => {
  if (!time) return '';
  const [hourStr = '', minuteStr = ''] = time.split(':');
  const hour = Number.parseInt(hourStr, 10);
  const minute = Number.parseInt(minuteStr, 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return time;

  const period = hour >= 12 ? 'PM' : 'AM';
  const normalizedHour = ((hour + 11) % 12) + 1;
  return `${normalizedHour}:${minute.toString().padStart(2, '0')} ${period}`;
};
