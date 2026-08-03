import { sendGroupBookingConfirmation } from '@/lib/email';

const OPTS = {
  to: 'student@example.com',
  fullName: 'Ada Obi',
  tutorialTitle: 'Anatomy Crash Course',
  tutorialDate: '2026-09-01',
  tutorialTime: '10:00',
  amountPaid: 15000,
  reference: 'ref_123',
};

describe('email send()', () => {
  const OLD_ENV = process.env;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env = { ...OLD_ENV, RESEND_API_KEY: 'test-key' };
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = OLD_ENV;
    jest.restoreAllMocks();
  });

  it('posts to Resend and logs nothing on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 }) as jest.Mock;

    await expect(sendGroupBookingConfirmation(OPTS)).resolves.toBeUndefined();
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({ method: 'POST' })
    );
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('logs when Resend rejects the message, without throwing', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => '{"message":"API key is invalid"}',
    }) as jest.Mock;

    await expect(sendGroupBookingConfirmation(OPTS)).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('401')
    );
  });

  it('logs network errors, without throwing', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('fetch failed')) as jest.Mock;

    await expect(sendGroupBookingConfirmation(OPTS)).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Network error'),
      expect.any(TypeError)
    );
  });

  it('skips sending entirely when RESEND_API_KEY is unset', async () => {
    delete process.env.RESEND_API_KEY;
    global.fetch = jest.fn() as jest.Mock;

    await expect(sendGroupBookingConfirmation(OPTS)).resolves.toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
