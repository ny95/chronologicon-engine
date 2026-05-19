const { parseEventLine } = require('../src/services/event-parser.service');

describe('parseEventLine', () => {
  it('parses a valid event line and calculates duration', () => {
    const parsed = parseEventLine(
      '11111111-1111-4111-8111-111111111111|Founding|2023-01-01T10:00:00Z|2023-01-01T11:30:00Z|NULL|Initial event',
      1,
      'sample.txt',
    );

    expect(parsed.ok).toBe(true);
    expect(parsed.event).toMatchObject({
      event_id: '11111111-1111-4111-8111-111111111111',
      duration_minutes: 90,
      parent_event_id: null,
      metadata: {
        sourceFileName: 'sample.txt',
        lineNumber: 1,
      },
    });
  });

  it('rejects malformed lines without throwing', () => {
    const parsed = parseEventLine('bad-id|Broken|2023-01-01T10:00:00Z', 7, 'sample.txt');

    expect(parsed.ok).toBe(false);
    expect(parsed.error).toContain('Line 7: Malformed entry');
  });

  it('rejects invalid date ordering', () => {
    const parsed = parseEventLine(
      '22222222-2222-4222-8222-222222222222|Bad Order|2023-01-01T11:00:00Z|2023-01-01T10:00:00Z|NULL|Invalid',
      3,
      'sample.txt',
    );

    expect(parsed.ok).toBe(false);
    expect(parsed.error).toContain('end_date must be after start_date');
  });
});
