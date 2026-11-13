import {
  SEMESTER_PLANS,
  isSemesterPlanId,
  perSessionPrice,
  semesterPlanCourseLabel,
  splitTotal,
  secondPaymentDueDate,
  isSplitOpen,
  daysUntil,
  formatDueDate,
} from '@/lib/semester-plan';

describe('semester plan', () => {
  it('prices the two plans as agreed', () => {
    expect(SEMESTER_PLANS.group).toMatchObject({ price: 100000, sessions: 50 });
    expect(SEMESTER_PLANS.private).toMatchObject({ price: 300000, sessions: 50 });
  });

  it('works out a per-session price', () => {
    expect(perSessionPrice(SEMESTER_PLANS.group)).toBe(2000);
    expect(perSessionPrice(SEMESTER_PLANS.private)).toBe(6000);
  });

  it('recognises only the real plan ids', () => {
    expect(isSemesterPlanId('group')).toBe(true);
    expect(isSemesterPlanId('private')).toBe(true);
    expect(isSemesterPlanId('undecided')).toBe(false);
    expect(isSemesterPlanId(undefined)).toBe(false);
  });

  it('labels the booking with the plan and semester', () => {
    expect(semesterPlanCourseLabel('private')).toBe(
      'Full Semester Plan: Private Semester Plan (First Semester, 2026/2027)'
    );
  });
});

describe('paying in 2', () => {
  const at = (iso: string) => new Date(iso);

  it('costs 10% more than paying in full', () => {
    expect(SEMESTER_PLANS.group.instalment).toBe(55000);
    expect(SEMESTER_PLANS.private.instalment).toBe(165000);
    expect(splitTotal('group')).toBe(110000);
    expect(splitTotal('private')).toBe(330000);
  });

  it('is due on 14 December for anyone who pays by 30 November', () => {
    expect(secondPaymentDueDate(at('2026-11-13T09:00:00Z'))).toBe('2026-12-14');
    expect(secondPaymentDueDate(at('2026-11-30T22:59:00Z'))).toBe('2026-12-14'); // 23:59 in Lagos
  });

  it('gives later joiners two weeks', () => {
    expect(secondPaymentDueDate(at('2026-11-30T23:30:00Z'))).toBe('2026-12-15'); // already 1 Dec in Lagos
    expect(secondPaymentDueDate(at('2026-12-05T12:00:00Z'))).toBe('2026-12-19');
    expect(secondPaymentDueDate(at('2026-12-20T12:00:00Z'))).toBe('2027-01-03');
    expect(secondPaymentDueDate(at('2027-01-25T12:00:00Z'))).toBe('2027-02-08');
  });

  it('is offered until 25 January, in Lagos time', () => {
    expect(isSplitOpen(at('2027-01-25T22:59:00Z'))).toBe(true);
    expect(isSplitOpen(at('2027-01-25T23:00:00Z'))).toBe(false);
  });

  it('counts days left in Lagos calendar days', () => {
    expect(daysUntil('2026-12-14', at('2026-12-07T08:00:00Z'))).toBe(7);
    expect(daysUntil('2026-12-14', at('2026-12-14T23:30:00Z'))).toBe(-1);
  });

  it('formats the due date for people', () => {
    expect(formatDueDate('2026-12-14')).toBe('Monday 14 December');
  });
});
