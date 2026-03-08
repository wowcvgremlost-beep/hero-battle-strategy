// Game calendar: 7 days per week, 4 weeks per month
// Day names cycle Mon-Sun, months are numbered

const DAY_NAMES = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

export const DAYS_PER_WEEK = 7;
export const WEEKS_PER_MONTH = 4;
export const DAYS_PER_MONTH = DAYS_PER_WEEK * WEEKS_PER_MONTH; // 28

export function getCalendar(day: number) {
  const dayIndex = (day - 1) % DAYS_PER_WEEK; // 0-6
  const weekInMonth = Math.floor(((day - 1) % DAYS_PER_MONTH) / DAYS_PER_WEEK) + 1; // 1-4
  const month = Math.floor((day - 1) / DAYS_PER_MONTH); // 0-based
  const monthName = MONTH_NAMES[month % MONTH_NAMES.length];
  const dayName = DAY_NAMES[dayIndex];
  const weekNumber = Math.floor((day - 1) / DAYS_PER_WEEK) + 1; // global week number (1-based)

  return {
    day,
    dayName,
    dayOfWeek: dayIndex + 1, // 1=Mon, 7=Sun
    weekInMonth,
    weekNumber,
    month: month + 1,
    monthName,
  };
}

export function isNewWeek(day: number): boolean {
  return (day - 1) % DAYS_PER_WEEK === 0;
}

export function isNewMonth(day: number): boolean {
  return (day - 1) % DAYS_PER_MONTH === 0;
}

export function getWeekNumber(day: number): number {
  return Math.floor((day - 1) / DAYS_PER_WEEK) + 1;
}

export function formatDate(day: number): string {
  const cal = getCalendar(day);
  return `${cal.dayName}, Неделя ${cal.weekInMonth}, ${cal.monthName}`;
}
