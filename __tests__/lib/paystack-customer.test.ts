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

  /** POST /customer response carrying the code the PUT needs. */
  function okWithCode(code = 'CUS_abc123') {
    return { ok: true, json: async () => ({ data: { customer_code: code } }) };
  }

  it('posts split name and phone to the customer endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(okWithCode());

    await upsertPaystackCustomer({
      secret: 'sk_test_x',
      email: 'ada@example.com',
      fullName: 'Ada Obi',
      phone: '+2348012345678',
    });

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('https://api.paystack.co/customer');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({
      email: 'ada@example.com',
      first_name: 'Ada',
      last_name: 'Obi',
      phone: '+2348012345678',
    });
  });

  // POST silently drops the phone on an existing customer; only PUT sets it.
  it('follows up with a PUT so the phone lands on an existing customer', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(okWithCode('CUS_xyz789'));

    await upsertPaystackCustomer({
      secret: 'sk_test_x',
      email: 'ada@example.com',
      fullName: 'Ada Obi',
      phone: '08103363907',
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    const [putUrl, putInit] = (global.fetch as jest.Mock).mock.calls[1];
    expect(putUrl).toBe('https://api.paystack.co/customer/CUS_xyz789');
    expect(putInit.method).toBe('PUT');
    expect(JSON.parse(putInit.body)).toEqual({
      first_name: 'Ada',
      last_name: 'Obi',
      phone: '08103363907',
    });
  });

  it('skips the PUT when there is no phone to store', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(okWithCode());

    await upsertPaystackCustomer({ secret: 'sk_test_x', email: 'ada@example.com', fullName: 'Ada' });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)).toEqual({
      email: 'ada@example.com',
      first_name: 'Ada',
    });
  });

  it('logs and stops when the POST returns no customer_code', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ data: {} }) });

    await upsertPaystackCustomer({
      secret: 'sk_test_x',
      email: 'ada@example.com',
      fullName: 'Ada Obi',
      phone: '08103363907',
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('no customer_code'));
  });

  it('logs a failed phone update without throwing', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(okWithCode())
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => '{"message":"Invalid phone"}',
      });

    await expect(
      upsertPaystackCustomer({
        secret: 'sk_test_x',
        email: 'ada@example.com',
        fullName: 'Ada Obi',
        phone: 'nonsense',
      })
    ).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('phone update failed'));
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
