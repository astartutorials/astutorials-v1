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
 * Two calls are needed. POST creates the customer, and on one that already
 * exists it updates the name but silently drops the phone — verified against
 * the API, and the reason the dashboard showed names with blank phone columns.
 * Only PUT /customer/:code sets the phone, so we follow up with one whenever we
 * have a number to store.
 *
 * Never throws — a failed customer record must not block a payment.
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
  const names = {
    ...(firstName ? { first_name: firstName } : {}),
    ...(lastName ? { last_name: lastName } : {}),
  };

  const headers = {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  };

  try {
    const res = await fetch(PAYSTACK_CUSTOMER_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, ...names, ...(phone ? { phone } : {}) }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "<unreadable>");
      console.error(
        `[paystack] customer upsert failed for ${email}: ${res.status} ${res.statusText} ${body}`
      );
      return;
    }

    if (!phone) return; // POST already handled the name

    const customerCode = (await res.json().catch(() => null))?.data?.customer_code;
    if (!customerCode) {
      console.error(`[paystack] no customer_code returned for ${email}; phone not set`);
      return;
    }

    const updateRes = await fetch(`${PAYSTACK_CUSTOMER_URL}/${encodeURIComponent(customerCode)}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ ...names, phone }),
    });

    if (!updateRes.ok) {
      const body = await updateRes.text().catch(() => "<unreadable>");
      console.error(
        `[paystack] customer phone update failed for ${email}: ${updateRes.status} ${updateRes.statusText} ${body}`
      );
    }
  } catch (err) {
    console.error(`[paystack] customer upsert network error for ${email}`, err);
  }
}
