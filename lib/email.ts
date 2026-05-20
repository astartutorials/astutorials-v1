const FROM = "A-Star Tutorials <bookings@astartutorials.com>";
const RESEND_URL = "https://api.resend.com/emails";

async function send(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return; // email is optional — never block the booking flow

  await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  }).catch(() => {}); // swallow network errors silently
}

export async function sendGroupBookingConfirmation(opts: {
  to: string;
  fullName: string;
  tutorialTitle: string;
  tutorialDate: string;
  tutorialTime: string;
  amountPaid: number;
  reference: string;
}) {
  const { to, fullName, tutorialTitle, tutorialDate, tutorialTime, amountPaid, reference } = opts;

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#0B1120">
      <h2 style="color:#D93025;margin-bottom:4px">Booking Confirmed</h2>
      <p style="margin-top:0;color:#666">Hi ${fullName}, your spot is reserved.</p>

      <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;width:40%">Tutorial</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${tutorialTitle}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Date</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee">${tutorialDate}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Time</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee">${tutorialTime}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Amount paid</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">₦${amountPaid.toLocaleString()}</td></tr>
        <tr><td style="padding:10px 0;color:#888">Reference</td>
            <td style="padding:10px 0;font-family:monospace;font-size:12px">${reference}</td></tr>
      </table>

      <p style="font-size:13px;color:#666;line-height:1.6">
        Keep your reference number as proof of payment.
      </p>

      <p style="font-size:12px;color:#999;margin-top:32px;line-height:1.8">
        Please do not reply to this email.<br/>
        For help, WhatsApp us on <strong>0916 046 5678</strong> or email <a href="mailto:support@astartutorials.com" style="color:#D93025">support@astartutorials.com</a>.
      </p>
      <p style="font-size:12px;color:#aaa">A-Star Tutorials · astartutorials.com</p>
    </div>
  `;

  await send(to, `Booking Confirmed — ${tutorialTitle}`, html);
}

export async function sendPrivateBookingReceipt(opts: {
  to: string;
  fullName: string;
  amountPaid: number;
  reference: string;
}) {
  const { to, fullName, amountPaid, reference } = opts;

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#0B1120">
      <h2 style="color:#D93025;margin-bottom:4px">Payment Received</h2>
      <p style="margin-top:0;color:#666">Hi ${fullName}, thanks for booking a private tutorial session.</p>

      <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;width:40%">Session type</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">Private Tutorial</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Amount paid</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">₦${amountPaid.toLocaleString()}</td></tr>
        <tr><td style="padding:10px 0;color:#888">Reference</td>
            <td style="padding:10px 0;font-family:monospace;font-size:12px">${reference}</td></tr>
      </table>

      <p style="font-size:13px;color:#666;line-height:1.6">
        A tutor will reach out to you on WhatsApp shortly to confirm your schedule and session details.
      </p>

      <p style="font-size:12px;color:#999;margin-top:32px;line-height:1.8">
        Please do not reply to this email.<br/>
        For help, WhatsApp us on <strong>0916 046 5678</strong> or email <a href="mailto:support@astartutorials.com" style="color:#D93025">support@astartutorials.com</a>.
      </p>
      <p style="font-size:12px;color:#aaa">A-Star Tutorials · astartutorials.com</p>
    </div>
  `;

  await send(to, "Private Tutorial Booking — Payment Received", html);
}
