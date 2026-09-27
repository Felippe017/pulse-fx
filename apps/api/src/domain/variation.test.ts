import { calculateVariation, formatVariation } from '../domain/variation';

describe('calculateVariation', () => {
  it('should calculate positive variation correctly', () => {
    // 5.50 → 5.60 = +1.8182%
    const result = calculateVariation(5.60, 5.50);
    expect(result).toBeCloseTo(1.8182, 3);
  });

  it('should calculate negative variation correctly', () => {
    // 5.50 → 5.40 = -1.8182%
    const result = calculateVariation(5.40, 5.50);
    expect(result).toBeCloseTo(-1.8182, 3);
  });

  it('should return zero when values are equal', () => {
    const result = calculateVariation(5.50, 5.50);
    expect(result).toBe(0);
  });

  it('should return null when current is null', () => {
    const result = calculateVariation(null, 5.50);
    expect(result).toBeNull();
  });

  it('should return null when previous is null', () => {
    const result = calculateVariation(5.50, null);
    expect(result).toBeNull();
  });

  it('should return null when previous is zero (avoid division by zero)', () => {
    const result = calculateVariation(5.50, 0);
    expect(result).toBeNull();
  });

  it('should handle large percentage changes', () => {
    // 100 → 200 = +100%
    const result = calculateVariation(200, 100);
    expect(result).toBe(100);
  });

  it('should handle small fractional changes', () => {
    // 5.5001 → 5.5002
    const result = calculateVariation(5.5002, 5.5001);
    expect(result).toBeCloseTo(0.0018, 3);
  });
});

describe('formatVariation', () => {
  it('should format positive variation with + sign', () => {
    expect(formatVariation(1.5)).toBe('+1.50%');
  });

  it('should format negative variation with - sign', () => {
    expect(formatVariation(-2.34)).toBe('-2.34%');
  });

  it('should format zero as +0.00%', () => {
    expect(formatVariation(0)).toBe('+0.00%');
  });

  it('should return N/A for null', () => {
    expect(formatVariation(null)).toBe('N/A');
  });
});
