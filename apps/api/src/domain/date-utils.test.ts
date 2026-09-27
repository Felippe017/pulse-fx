import {
  isWeekday,
  getPreviousBusinessDay,
  getMonthsAgo,
  formatDateISO,
  formatDateBCB,
  formatDateSGS,
  getDaysAgo,
} from '../domain/date-utils';

describe('isWeekday', () => {
  it('should return true for Monday', () => {
    // 2024-01-15 is a Monday
    expect(isWeekday(new Date(2024, 0, 15))).toBe(true);
  });

  it('should return true for Friday', () => {
    // 2024-01-19 is a Friday
    expect(isWeekday(new Date(2024, 0, 19))).toBe(true);
  });

  it('should return false for Saturday', () => {
    // 2024-01-20 is a Saturday
    expect(isWeekday(new Date(2024, 0, 20))).toBe(false);
  });

  it('should return false for Sunday', () => {
    // 2024-01-21 is a Sunday
    expect(isWeekday(new Date(2024, 0, 21))).toBe(false);
  });
});

describe('getPreviousBusinessDay', () => {
  it('should return Friday when given Monday', () => {
    const monday = new Date(2024, 0, 15); // Monday
    const result = getPreviousBusinessDay(monday);
    expect(result.getDay()).toBe(5); // Friday
    expect(result.getDate()).toBe(12);
  });

  it('should return Friday when given Saturday', () => {
    const saturday = new Date(2024, 0, 20); // Saturday
    const result = getPreviousBusinessDay(saturday);
    expect(result.getDay()).toBe(5); // Friday
    expect(result.getDate()).toBe(19);
  });

  it('should return Friday when given Sunday', () => {
    const sunday = new Date(2024, 0, 21); // Sunday
    const result = getPreviousBusinessDay(sunday);
    expect(result.getDay()).toBe(5); // Friday
    expect(result.getDate()).toBe(19);
  });

  it('should return Thursday when given Friday', () => {
    const friday = new Date(2024, 0, 19); // Friday
    const result = getPreviousBusinessDay(friday);
    expect(result.getDay()).toBe(4); // Thursday
    expect(result.getDate()).toBe(18);
  });
});

describe('getMonthsAgo', () => {
  it('should return date N months ago', () => {
    const date = new Date(2024, 5, 15); // June 15
    const result = getMonthsAgo(date, 3);
    expect(result.getMonth()).toBe(2); // March
    expect(result.getDate()).toBe(15);
  });

  it('should handle year boundary', () => {
    const date = new Date(2024, 1, 15); // Feb 15, 2024
    const result = getMonthsAgo(date, 3);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth()).toBe(10); // November
  });
});

describe('formatDateISO', () => {
  it('should format date as YYYY-MM-DD', () => {
    const date = new Date(2024, 0, 5); // Jan 5, 2024
    expect(formatDateISO(date)).toBe('2024-01-05');
  });
});

describe('formatDateBCB', () => {
  it('should format date as MM-dd-yyyy', () => {
    const date = new Date(2024, 0, 5); // Jan 5, 2024
    expect(formatDateBCB(date)).toBe('01-05-2024');
  });
});

describe('formatDateSGS', () => {
  it('should format date as dd/MM/yyyy', () => {
    const date = new Date(2024, 0, 5); // Jan 5, 2024
    expect(formatDateSGS(date)).toBe('05/01/2024');
  });
});

describe('getDaysAgo', () => {
  it('should return date N days ago', () => {
    const date = new Date(2024, 0, 15); // Jan 15
    const result = getDaysAgo(date, 10);
    expect(result.getDate()).toBe(5);
    expect(result.getMonth()).toBe(0); // January
  });
});
