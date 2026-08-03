const mockLimit = jest.fn();

jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: Object.assign(
    jest.fn().mockImplementation(() => ({ limit: mockLimit })),
    { slidingWindow: jest.fn() }
  ),
}));

jest.mock('@upstash/redis', () => ({
  Redis: { fromEnv: jest.fn(() => ({})) },
}));

describe('checkLoginRateLimit', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    mockLimit.mockReset();
    process.env = { ...OLD_ENV };
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = OLD_ENV;
    jest.restoreAllMocks();
  });

  async function load() {
    return (await import('@/lib/rate-limit')).checkLoginRateLimit;
  }

  it('allows the request when Upstash is not configured', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const checkLoginRateLimit = await load();
    await expect(checkLoginRateLimit('1.2.3.4')).resolves.toEqual({ allowed: true });
    expect(mockLimit).not.toHaveBeenCalled();
  });

  it('blocks the request when the limiter says the window is exhausted', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    mockLimit.mockResolvedValue({ success: false });

    const checkLoginRateLimit = await load();
    await expect(checkLoginRateLimit('1.2.3.4')).resolves.toEqual({ allowed: false });
    expect(mockLimit).toHaveBeenCalledWith('login:1.2.3.4');
  });

  it('fails open when Redis is unreachable', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    mockLimit.mockRejectedValue(new TypeError('fetch failed'));

    const checkLoginRateLimit = await load();
    await expect(checkLoginRateLimit('1.2.3.4')).resolves.toEqual({ allowed: true });
  });
});
