/**
 * Starts a Paystack checkout and returns the page to send the payer to.
 * Paystack calls back to /api/paystack/verify, which records the booking.
 */
export async function initializePaystackTransaction(opts: {
  secret: string;
  email: string;
  /** In naira; converted to kobo here. */
  amount: number;
  metadata: Record<string, unknown>;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: opts.email,
      amount: opts.amount * 100, // Paystack expects kobo
      callback_url: `${baseUrl}/api/paystack/verify`,
      metadata: opts.metadata,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    return { ok: false, error: data.message ?? "Failed to initialise payment" };
  }
  return { ok: true, url: data.data.authorization_url };
}
