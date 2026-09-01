import {
  PLAYBOOKS,
  PLAYBOOK_SLUGS,
  getPlaybook,
  isPlaybookOpen,
  playbookHref,
} from '@/lib/playbooks';

/**
 * The Playbook series is driven entirely by config: one landing component, one
 * API route and one admin console all read these objects. That makes a typo in
 * a config a production bug with no compiler to catch it — an empty topic list
 * renders a blank centrepiece, a duplicate slug silently shadows a webinar in
 * the registry map, a mismatched date sells a seat for a session that has run.
 *
 * These tests are the guardrail the type system can't be.
 */
describe('the registry', () => {
  it('exposes every playbook by slug', () => {
    for (const pb of PLAYBOOKS) {
      expect(getPlaybook(pb.slug)).toBe(pb);
    }
  });

  it('returns undefined for an unknown slug, so the API can reject one', () => {
    expect(getPlaybook('economics')).toBeUndefined();
    expect(getPlaybook('')).toBeUndefined();
  });

  it('gives every playbook a distinct slug', () => {
    expect(new Set(PLAYBOOK_SLUGS).size).toBe(PLAYBOOKS.length);
  });

  it('gives every playbook a distinct close instant', () => {
    // The Programmes menu sorts past programmes most-recently-ended first,
    // which only reads as a history if no two share an instant.
    const times = PLAYBOOKS.map((p) => p.closesAt.getTime());
    expect(new Set(times).size).toBe(times.length);
  });

  it('builds hrefs under /playbooks', () => {
    expect(playbookHref('engineering')).toBe('/playbooks/engineering');
  });

  it('matches slug to accent, which is what selects the CSS palette', () => {
    // components/playbooks/PlaybookLanding sets data-playbook={accent}; a
    // mismatch would silently fall back to the brand red.
    for (const pb of PLAYBOOKS) {
      expect(pb.accent).toBe(pb.slug);
    }
  });
});

describe('every playbook config', () => {
  it.each(PLAYBOOKS)('$slug carries the three-topic Playbook', (pb) => {
    expect(pb.topics).toHaveLength(3);
    for (const topic of pb.topics) {
      expect(topic.title.length).toBeGreaterThan(0);
      expect(topic.prompt.length).toBeGreaterThan(0);
      expect(topic.covers.length).toBeGreaterThan(0);
      expect(topic.takeaway.length).toBeGreaterThan(0);
    }
  });

  it.each(PLAYBOOKS)('$slug answers exactly three questions', (pb) => {
    expect(pb.questions).toHaveLength(3);
  });

  it.each(PLAYBOOKS)('$slug schedules the full 90 minutes in four segments', (pb) => {
    expect(pb.segments).toHaveLength(4);
    expect(pb.segments[0].time.startsWith('0–')).toBe(true);
    expect(pb.segments[pb.segments.length - 1].time.endsWith('–90')).toBe(true);
  });

  it.each(PLAYBOOKS)('$slug fills every section the landing page renders', (pb) => {
    expect(pb.bigIdeaParas.length).toBeGreaterThan(0);
    expect(pb.qaQuestions.length).toBeGreaterThan(0);
    expect(pb.speakerStrategy.length).toBeGreaterThan(0);
    expect(pb.advantage.items.length).toBeGreaterThan(0);
    expect(pb.audience.length).toBeGreaterThan(0);
    expect(pb.feature.items.length).toBeGreaterThan(0);
    expect(pb.moderatorRule.vague.length).toBeGreaterThan(0);
    expect(pb.moderatorRule.followUp.length).toBeGreaterThan(0);
  });

  it.each(PLAYBOOKS)('$slug offers a level to select', (pb) => {
    expect(pb.form.levels.length).toBeGreaterThan(0);
  });

  // The modal drops the whole field when the label is empty, so a label with no
  // options behind it would render an unanswerable required select.
  it.each(PLAYBOOKS)('$slug pairs a discipline label with discipline options', (pb) => {
    expect(pb.form.disciplineLabel === '').toBe(pb.form.disciplines.length === 0);
  });

  it.each(PLAYBOOKS)('$slug describes the date it closes on', (pb) => {
    // A close instant that doesn't match the printed date sells a seat for a
    // session that has already run, or shuts registration while the page still
    // advertises it as open.
    const day = pb.closesAt.getUTCDate();
    const year = pb.closesAt.getUTCFullYear();
    expect(pb.dateLabel).toContain(String(day));
    expect(pb.dateLabel).toContain(String(year));
  });

  it.each(PLAYBOOKS)('$slug closes at 19:00 WAT, when the webinar starts', (pb) => {
    expect(pb.closesAt.getUTCHours()).toBe(18);
    expect(pb.closesAt.getUTCMinutes()).toBe(0);
    expect(pb.timeLabel).toContain('7:00 pm');
  });
});

describe('isPlaybookOpen', () => {
  it.each(PLAYBOOKS)('$slug is open at its close instant and shut just after', (pb) => {
    expect(isPlaybookOpen(pb, new Date(pb.closesAt.getTime()))).toBe(true);
    expect(isPlaybookOpen(pb, new Date(pb.closesAt.getTime() + 1000))).toBe(false);
  });

  it.each(PLAYBOOKS)('$slug is open a week before it runs', (pb) => {
    const week = 7 * 24 * 60 * 60 * 1000;
    expect(isPlaybookOpen(pb, new Date(pb.closesAt.getTime() - week))).toBe(true);
  });
});
