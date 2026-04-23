import { formatDate, truncateContent, CATEGORIES } from '@/lib/community/helpers';

describe('formatDate', () => {
  it('returns "just now" for dates less than 1 minute ago', () => {
    const date = new Date(Date.now() - 30 * 1000); // 30 seconds ago
    expect(formatDate(date)).toBe('just now');
  });

  it('returns minutes ago for dates less than 1 hour ago', () => {
    const date = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
    expect(formatDate(date)).toBe('15m ago');
  });

  it('returns hours ago for dates less than 24 hours ago', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
    expect(formatDate(date)).toBe('3h ago');
  });

  it('returns days ago for dates less than 7 days ago', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    expect(formatDate(date)).toBe('2d ago');
  });

  it('returns formatted date string for dates older than 7 days', () => {
    const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    const result = formatDate(date);
    expect(result).toMatch(/[A-Z][a-z]+ \d+/); // e.g. "Apr 13"
  });
});

describe('truncateContent', () => {
  it('returns content unchanged if under maxLength', () => {
    const short = 'Hello world';
    expect(truncateContent(short, 150)).toBe('Hello world');
  });

  it('returns content unchanged if exactly maxLength', () => {
    const exact = 'a'.repeat(150);
    expect(truncateContent(exact, 150)).toBe(exact);
  });

  it('truncates content and appends ellipsis if over maxLength', () => {
    const long = 'a'.repeat(200);
    const result = truncateContent(long, 150);
    expect(result).toHaveLength(153); // 150 + '...'
    expect(result.endsWith('...')).toBe(true);
  });

  it('uses default maxLength of 150', () => {
    const long = 'b'.repeat(200);
    const result = truncateContent(long);
    expect(result).toHaveLength(153);
  });

  it('handles empty string', () => {
    expect(truncateContent('')).toBe('');
  });
});

describe('CATEGORIES', () => {
  it('contains exactly 5 categories', () => {
    expect(CATEGORIES).toHaveLength(5);
  });

  it('contains all required category values', () => {
    const values = CATEGORIES.map((c) => c.value);
    expect(values).toContain('general');
    expect(values).toContain('study');
    expect(values).toContain('projects');
    expect(values).toContain('announcements');
    expect(values).toContain('events');
  });

  it('every category has a non-empty label', () => {
    CATEGORIES.forEach((cat) => {
      expect(cat.label.length).toBeGreaterThan(0);
    });
  });
});
