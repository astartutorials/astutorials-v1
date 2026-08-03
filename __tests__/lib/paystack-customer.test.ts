import { splitFullName, upsertPaystackCustomer } from '@/lib/paystack-customer';

describe('splitFullName', () => {
  it('splits a two-part name', () => {
    expect(splitFullName('Ada Obi')).toEqual({ firstName: 'Ada', lastName: 'Obi' });
  });

  it('keeps everything after the first token as the last name', () => {
    expect(splitFullName('Ada Chi Obi')).toEqual({ firstName: 'Ada', lastName: 'Chi Obi' });
  });

  it('handles a single-token name', () => {
    expect(splitFullName('Ada')).toEqual({ firstName: 'Ada', lastName: '' });
  });

  it('collapses stray whitespace', () => {
    expect(splitFullName('  Ada   Obi  ')).toEqual({ firstName: 'Ada', lastName: 'Obi' });
  });

  it('handles an empty string', () => {
    expect(splitFullName('   ')).toEqual({ firstName: '', lastName: '' });
  });
});

describe('upsertPaystackCustomer', () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('posts split name and phone to the customer endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    await upsertPaystackCustomer({
      secret: 'sk_test_x',
      email: 'ada@example.com',
      fullName: 'Ada Obi',
      phone: '+2348012345678',
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('https://api.paystack.co/customer');
    expect(JSON.parse(init.body)).toEqual({
      email: 'ada@example.com',
      first_name: 'Ada',
      last_name: 'Obi',
      phone: '+2348012345678',
    });
  });

  it('omits fields that are absent rather than sending empty strings', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    await upsertPaystackCustomer({ secret: 'sk_test_x', email: 'ada@example.com', fullName: 'Ada' });

    expect(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)).toEqual({
      email: 'ada@example.com',
      first_name: 'Ada',
    });
  });

  it('skips the call entirely when there is no name or phone', async () => {
    await upsertPaystackCustomer({ secret: 'sk_test_x', email: 'ada@example.com' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('ignores non-string metadata values', async () => {
    await upsertPaystackCustomer({
      secret: 'sk_test_x',
      email: 'ada@example.com',
      fullName: 42,
      phone: null,
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('logs and does not throw when Paystack rejects the upsert', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () => '{"message":"Invalid phone"}',
    });

    await expect(
      upsertPaystackCustomer({ secret: 'sk_test_x', email: 'ada@example.com', fullName: 'Ada Obi' })
    ).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('400'));
  });

  it('logs and does not throw on a network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new TypeError('fetch failed'));

    await expect(
      upsertPaystackCustomer({ secret: 'sk_test_x', email: 'ada@example.com', fullName: 'Ada Obi' })
    ).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('network error'),
      expect.any(TypeError)
    );
  });
});
