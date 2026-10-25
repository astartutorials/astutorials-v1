import {
  SEMESTER_PLANS,
  isSemesterPlanId,
  perSessionPrice,
  semesterPlanCourseLabel,
} from '@/lib/semester-plan';

describe('semester plan', () => {
  it('prices the two plans as agreed', () => {
    expect(SEMESTER_PLANS.group).toMatchObject({ price: 75000, sessions: 50 });
    expect(SEMESTER_PLANS.private).toMatchObject({ price: 250000, sessions: 50 });
  });

  it('works out a per-session price', () => {
    expect(perSessionPrice(SEMESTER_PLANS.group)).toBe(1500);
    expect(perSessionPrice(SEMESTER_PLANS.private)).toBe(5000);
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
