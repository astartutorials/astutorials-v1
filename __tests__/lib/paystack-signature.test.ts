import crypto from 'crypto';
import { verifyPaystackSignature } from '@/lib/paystack-signature';

/**
 * This is the only thing standing between the webhook and a forged payment
 * notification. A request that passes it gets a booking row written with
 * whatever amount and reference the caller supplied.
 */

const SECRET = 'sk_test_secret';
const BODY = JSON.stringify({ event: 'charge.success', data: { reference: 'ref_1', amount: 600000 } });

const sign = (body: string, secret = SECRET) =>
  crypto.createHmac('sha512', secret).update(body).digest('hex');

describe('verifyPaystackSignature', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV, PAYSTACK_SECRET_KEY: SECRET };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('accepts a body signed with the live secret', () => {
    expect(verifyPaystackSignature(BODY, sign(BODY))).toBe(true);
  });

  it('rejects a signature produced with a different secret', () => {
    expect(verifyPaystackSignature(BODY, sign(BODY, 'attacker-secret'))).toBe(false);
  });

  it('rejects a valid signature replayed against a tampered body', () => {
    const signature = sign(BODY);
    const tampered = JSON.stringify({
      event: 'charge.success',
      data: { reference: 'ref_1', amount: 1 },
    });
    expect(verifyPaystackSignature(tampered, signature)).toBe(false);
  });

  it('rejects a missing signature header', () => {
    expect(verifyPaystackSignature(BODY, null)).toBe(false);
  });

  it('rejects an empty signature', () => {
    expect(verifyPaystackSignature(BODY, '')).toBe(false);
  });

  it('rejects garbage that is not a hash at all', () => {
    expect(verifyPaystackSignature(BODY, 'not-a-signature')).toBe(false);
  });

  // Fail closed: an unset secret must not turn into "accept everything".
  it('rejects everything when PAYSTACK_SECRET_KEY is unset', () => {
    delete process.env.PAYSTACK_SECRET_KEY;
    expect(verifyPaystackSignature(BODY, sign(BODY))).toBe(false);
  });

  it('is sensitive to whitespace, so the raw body must be verified verbatim', () => {
    // Re-serialising before verifying would silently break authenticity.
    const reserialised = JSON.stringify(JSON.parse(BODY), null, 2);
    expect(verifyPaystackSignature(reserialised, sign(BODY))).toBe(false);
  });
});
