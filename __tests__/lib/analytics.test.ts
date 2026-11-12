const init = jest.fn();
const capture = jest.fn();
const identify = jest.fn();
jest.mock('posthog-js', () => ({ __esModule: true, default: { init, capture, identify, captureException: jest.fn() } }));

// The wrapper only runs in a browser; give the node test env a window.
(global as unknown as { window: object }).window = global;

import analytics, { loadAnalytics } from '@/lib/analytics';

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('lazy analytics', () => {
  it('queues calls made before PostHog loads, then sends them in order', async () => {
    analytics.identify('a@b.com', { name: 'A' });
    analytics.capture('first');
    expect(capture).not.toHaveBeenCalled();

    await loadAnalytics();
    await flush();
    expect(init).toHaveBeenCalledTimes(1);
    expect(identify).toHaveBeenCalledWith('a@b.com', { name: 'A' });
    expect(capture).toHaveBeenCalledWith('first');
  });

  it('calls straight through once loaded, and initialises only once', async () => {
    analytics.capture('second', { x: 1 });
    expect(capture).toHaveBeenLastCalledWith('second', { x: 1 });
    await loadAnalytics();
    expect(init).toHaveBeenCalledTimes(1);
  });
});
