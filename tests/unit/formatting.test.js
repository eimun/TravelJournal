import { formatCountdown, formatInr } from '../../src/domain/format';

describe('formatCountdown', () => {
  it('drops the hour part under an hour', () => {
    expect(formatCountdown(42)).toBe('42 MIN');
  });

  it('shows hours and minutes past the hour', () => {
    expect(formatCountdown(72)).toBe('1h 12 MIN');
  });

  it('floors partial minutes rather than rounding up past the start time', () => {
    expect(formatCountdown(42.9)).toBe('42 MIN');
  });

  it('never counts below zero once the activity has started', () => {
    expect(formatCountdown(-30)).toBe('0 MIN');
  });

  it('reads as zero exactly on the hour boundary', () => {
    expect(formatCountdown(60)).toBe('1h 0 MIN');
  });
});

describe('formatInr', () => {
  it('groups in the Indian lakh/crore convention, not thousands', () => {
    expect(formatInr(85000)).toBe('₹85,000');
    expect(formatInr(153760)).toBe('₹1,53,760');
  });

  it('rounds to whole rupees', () => {
    expect(formatInr(1234.6)).toBe('₹1,235');
  });

  it('handles zero', () => {
    expect(formatInr(0)).toBe('₹0');
  });
});
