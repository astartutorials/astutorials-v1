// Mock global fetch so tests never make real network requests
global.fetch = jest.fn();

// Two-step sign-in: route and middleware tests run as a session that has
// already entered its code. __tests__/lib/mfa.test.ts and the rbac MFA tests
// override this to cover the refusals.
jest.mock('@/lib/mfa', () => ({
  ...jest.requireActual('@/lib/mfa'),
  getMfaStatus: jest.fn().mockResolvedValue({ verified: true, hasFactor: true }),
}));
