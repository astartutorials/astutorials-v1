const PAYSTACK_CUSTOMER_URL = "https://api.paystack.co/customer";

/**
 * Paystack stores names as separate first/last fields, but every booking form
 * collects a single full name. First token is the first name, the remainder is
 * the last name — "Ada Chi Obi" becomes "Ada" / "Chi Obi".
 */
export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/**
 * Registers the customer's name and phone with Paystack so the dashboard shows
 * more than an email address. transaction/initialize silently ignores these
 * fields, so they have to be sent to the customer endpoint separately.
 *
 * Never throws — a failed customer record must not block a payment. Note that
 * Paystack does not overwrite an existing customer, so this only fills in
 * details the first time an email is seen.
 */
export async function upsertPaystackCustomer(opts: {
  secret: string;
  email: string;
  fullName?: unknown;
  phone?: unknown;
}): Promise<void> {
  const { secret, email } = opts;
  const fullName = typeof opts.fullName === "string" ? opts.fullName.trim() : "";
  const phone = typeof opts.phone === "string" ? opts.phone.trim() : "";

  if (!fullName && !phone) return; // nothing to add beyond the email

  const { firstName, lastName } = splitFullName(fullName);

  try {
    const res = await fetch(PAYSTACK_CUSTOMER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        ...(firstName ? { first_name: firstName } : {}),
        ...(lastName ? { last_name: lastName } : {}),
        ...(phone ? { phone } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "<unreadable>");
      console.error(
        `[paystack] customer upsert failed for ${email}: ${res.status} ${res.statusText} ${body}`
      );
    }
  } catch (err) {
    console.error(`[paystack] customer upsert network error for ${email}`, err);
  }
}
