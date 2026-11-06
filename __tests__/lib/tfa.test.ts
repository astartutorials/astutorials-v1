import { tfaIcs, tfaGoogleCalendarUrl, isTfaOpen, TFA_CLOSES_AT, TFA_QUESTION_TARGETS, TFA_PANELLISTS } from '@/lib/tfa';

describe('lib/tfa', () => {
  it('closes registration when the event ends', () => {
    expect(isTfaOpen(new Date(TFA_CLOSES_AT.getTime()))).toBe(true);
    expect(isTfaOpen(new Date(TFA_CLOSES_AT.getTime() + 1))).toBe(false);
  });

  it('puts the event at 10:00–15:00 WAT in calendar links', () => {
    expect(tfaGoogleCalendarUrl()).toContain('dates=20261108T090000Z%2F20261108T140000Z');
    const ics = tfaIcs();
    expect(ics).toContain('DTSTART:20261108T090000Z');
    expect(ics).toContain('DTEND:20261108T140000Z');
    // Commas in the venue must be escaped or calendar apps split the field.
    expect(ics).toMatch(/LOCATION:600-Seater Auditorium\\, /);
  });

  it('lets a question go to any speaker, the keynote, the convener or any panellist', () => {
    expect(TFA_QUESTION_TARGETS).toHaveLength(3 + TFA_PANELLISTS.length);
  });
});
