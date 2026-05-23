const FROM = "Juyi at A-Star Tutorials <bookings@astartutorials.com>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://astartutorials.com";
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

export async function sendPrivateBookingDetails(opts: {
  to: string;
  fullName: string;
  course: string;
  courseOfStudy: string;
  level: string;
  schedule: string;
  reference: string;
}) {
  const { to, fullName, course, courseOfStudy, level, schedule, reference } = opts;

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#0B1120">
      <h2 style="color:#D93025;margin-bottom:4px">Session Details Confirmed</h2>
      <p style="margin-top:0;color:#666">Hi ${fullName}, we have everything we need to match you with a tutor.</p>

      <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;width:40%">Course</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${course}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Course of Study</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee">${courseOfStudy}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Level</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee">${level}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Preferred Schedule</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee">${schedule}</td></tr>
        <tr><td style="padding:10px 0;color:#888">Reference</td>
            <td style="padding:10px 0;font-family:monospace;font-size:12px">${reference}</td></tr>
      </table>

      <p style="font-size:13px;color:#666;line-height:1.6">
        A tutor will contact you on WhatsApp shortly to confirm your schedule and get your sessions started.
      </p>

      <p style="font-size:12px;color:#999;margin-top:32px;line-height:1.8">
        Please do not reply to this email.<br/>
        For help, WhatsApp us on <strong>0916 046 5678</strong> or email <a href="mailto:support@astartutorials.com" style="color:#D93025">support@astartutorials.com</a>.
      </p>
      <p style="font-size:12px;color:#aaa">A-Star Tutorials · astartutorials.com</p>
    </div>
  `;

  await send(to, "Private Tutorial — Session Details Confirmed", html);
}

export async function sendNewBookingNotification(opts: {
  bookingType: 'group' | 'private';
  fullName: string;
  email: string;
  phone: string | null;
  amountPaid: number;
  reference: string;
  tutorialTitle?: string;
  course?: string;
}) {
  const notifyEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!notifyEmail) return;

  const { bookingType, fullName, email, phone, amountPaid, reference, tutorialTitle, course } = opts;
  const subject = bookingType === 'group'
    ? `New Group Booking — ${tutorialTitle ?? 'Tutorial'}`
    : `New Private Booking — ${fullName}`;

  const rows = [
    ['Type', bookingType === 'group' ? 'Group Tutorial' : 'Private Tutorial'],
    ['Student', fullName],
    ['Email', email],
    ...(phone ? [['Phone', phone]] : []),
    ...(tutorialTitle ? [['Tutorial', tutorialTitle]] : []),
    ...(course ? [['Course', course]] : []),
    ['Amount', `₦${amountPaid.toLocaleString()}`],
    ['Reference', reference],
  ] as [string, string][];

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#0B1120">
      <h2 style="color:#D93025;margin-bottom:4px">New Booking</h2>
      <p style="margin-top:0;color:#666">A new payment has been verified.</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px">
        ${rows.map(([label, value]) => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;width:40%">${label}</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${value}</td>
          </tr>`).join('')}
      </table>
      <a href="${BASE_URL}/admin/payments" style="display:inline-block;background:#D93025;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px">
        View in Admin Panel
      </a>
      <p style="font-size:12px;color:#aaa;margin-top:32px">A-Star Tutorials · astartutorials.com</p>
    </div>
  `;

  await send(notifyEmail, subject, html);
}

export async function sendInviteEmail(opts: {
  to: string;
  invitedBy: string;
  role: string;
  orgName: string | null;
  token: string;
}) {
  const { to, invitedBy, role, orgName, token } = opts;
  const link = `${BASE_URL}/admin/invite?token=${token}`;

  const roleLabel: Record<string, string> = {
    org_admin: 'Org Admin',
    tutor_manager: 'Tutor Manager',
    tutor: 'Tutor',
    viewer: 'Viewer',
  };

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#0B1120">
      <h2 style="color:#D93025;margin-bottom:4px">You've been invited</h2>
      <p style="margin-top:0;color:#666">
        ${invitedBy} has invited you to join A-Star Tutorials${orgName ? ` (${orgName})` : ''} as <strong>${roleLabel[role] ?? role}</strong>.
      </p>
      <p style="font-size:14px;color:#444;margin:24px 0 8px">Click below to set up your account. This link expires in 7 days.</p>
      <a href="${link}" style="display:inline-block;background:#D93025;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
        Accept Invitation
      </a>
      <p style="font-size:12px;color:#999;margin-top:32px;line-height:1.8">
        If you weren't expecting this, you can safely ignore it.<br/>
        For help, email <a href="mailto:support@astartutorials.com" style="color:#D93025">support@astartutorials.com</a>.
      </p>
      <p style="font-size:12px;color:#aaa">A-Star Tutorials · astartutorials.com</p>
    </div>
  `;

  await send(to, `You've been invited to A-Star Tutorials`, html);
}

export async function sendApplicationShortlisted(opts: { to: string; fullName: string }) {
  const { to, fullName } = opts;
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#0B1120">
      <h2 style="color:#D93025;margin-bottom:4px">Great news, ${fullName}!</h2>
      <p style="margin-top:0;color:#666;line-height:1.6">
        Thank you for applying to tutor with A-Star Tutorials. We've reviewed your application and are pleased to let you know that you've been <strong>shortlisted</strong> for further consideration.
      </p>
      <p style="color:#666;line-height:1.6">
        A member of our team will be in touch soon with next steps. In the meantime, feel free to reach out if you have any questions.
      </p>
      <p style="font-size:12px;color:#999;margin-top:32px;line-height:1.8">
        For help, email <a href="mailto:support@astartutorials.com" style="color:#D93025">support@astartutorials.com</a>.
      </p>
      <p style="font-size:12px;color:#aaa">A-Star Tutorials · astartutorials.com</p>
    </div>
  `;
  await send(to, 'Your A-Star Tutorials application — update', html);
}

export async function sendApplicationRejected(opts: { to: string; fullName: string }) {
  const { to, fullName } = opts;
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#0B1120">
      <h2 style="color:#D93025;margin-bottom:4px">Hi ${fullName},</h2>
      <p style="margin-top:0;color:#666;line-height:1.6">
        Thank you for your interest in joining A-Star Tutorials as a tutor and for the time you took to apply.
      </p>
      <p style="color:#666;line-height:1.6">
        After careful consideration, we won't be moving forward with your application at this time. We encourage you to apply again in the future as our needs change.
      </p>
      <p style="color:#666;line-height:1.6">We wish you all the best.</p>
      <p style="font-size:12px;color:#999;margin-top:32px;line-height:1.8">
        For help, email <a href="mailto:support@astartutorials.com" style="color:#D93025">support@astartutorials.com</a>.
      </p>
      <p style="font-size:12px;color:#aaa">A-Star Tutorials · astartutorials.com</p>
    </div>
  `;
  await send(to, 'Your A-Star Tutorials application', html);
}

export async function sendApplicationAccepted(opts: { to: string; fullName: string }) {
  const { to, fullName } = opts;
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#0B1120">
      <h2 style="color:#D93025;margin-bottom:4px">Congratulations, ${fullName}!</h2>
      <p style="margin-top:0;color:#666;line-height:1.6">
        We're delighted to let you know that your application to join A-Star Tutorials has been <strong>accepted</strong>. Welcome to the team!
      </p>
      <p style="color:#666;line-height:1.6">
        You'll receive a separate email shortly with a link to set up your account on our platform. If you don't see it within 24 hours, please check your spam folder.
      </p>
      <p style="color:#666;line-height:1.6">We look forward to working with you.</p>
      <p style="font-size:12px;color:#999;margin-top:32px;line-height:1.8">
        For help, email <a href="mailto:support@astartutorials.com" style="color:#D93025">support@astartutorials.com</a>.
      </p>
      <p style="font-size:12px;color:#aaa">A-Star Tutorials · astartutorials.com</p>
    </div>
  `;
  await send(to, 'Your A-Star Tutorials application — accepted!', html);
}
