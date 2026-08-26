import {
  BUCC_EVENT_NAME,
  BUCC_TAGLINE,
  BUCC_DATE_LABEL,
  BUCC_TIME_LABEL,
  BUCC_DURATION_LABEL,
  BUCC_PLATFORM,
  BUCC_MEETING_URL,
} from "@/lib/bucc";

const FROM = "Juyi at A-Star Tutorials <bookings@astartutorials.com>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://astartutorials.com";
const RESEND_URL = "https://api.resend.com/emails";

// Never throws — a failed receipt must not roll back a paid booking. But every
// failure is logged: silent email loss is undiagnosable, and these carry booking
// confirmations. Returns whether the message was accepted by Resend.
async function send(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false; // email is optional — never block the booking flow

  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });

    if (!res.ok) {
      // A non-2xx resolves normally, so without this check an expired API key,
      // an unverified domain, or a 429 would look identical to a successful send.
      const body = await res.text().catch(() => "<unreadable>");
      console.error(
        `[email] Resend rejected "${subject}" for ${to}: ${res.status} ${res.statusText} ${body}`
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error(`[email] Network error sending "${subject}" to ${to}`, err);
    return false;
  }
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

export async function sendPreClinicalsReceipt(opts: {
  to: string;
  fullName: string;
  amountPaid: number;
  reference: string;
}) {
  const { to, fullName, amountPaid, reference } = opts;

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#0B1120">
      <h2 style="color:#D93025;margin-bottom:4px">You're in! 🎉</h2>
      <p style="margin-top:0;color:#666">Hi ${fullName}, your spot in the Pre-Clinicals Introductory Online Classes is confirmed.</p>

      <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;width:40%">Program</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">Pre-Clinicals Introductory Classes</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Dates</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">3rd – 30th August 2026</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Amount paid</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">₦${amountPaid.toLocaleString()}</td></tr>
        <tr><td style="padding:10px 0;color:#888">Reference</td>
            <td style="padding:10px 0;font-family:monospace;font-size:12px">${reference}</td></tr>
      </table>

      <p style="font-size:13px;color:#666;line-height:1.6">
        Please join our WhatsApp so we can add you to the class community and share the schedule, quizzes and resources.
      </p>

      <p style="font-size:12px;color:#999;margin-top:32px;line-height:1.8">
        Please do not reply to this email.<br/>
        For help, WhatsApp us on <strong>0916 046 5678</strong> or email <a href="mailto:support@astartutorials.com" style="color:#D93025">support@astartutorials.com</a>.
      </p>
      <p style="font-size:12px;color:#aaa">A-Star Tutorials · astartutorials.com</p>
    </div>
  `;

  await send(to, "Pre-Clinicals Classes — Payment Received", html);
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
  bookingType: 'group' | 'private' | 'preclinicals';
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
    : bookingType === 'preclinicals'
    ? `New Pre-Clinicals Registration — ${fullName}`
    : `New Private Booking — ${fullName}`;

  const typeLabel = bookingType === 'group'
    ? 'Group Tutorial'
    : bookingType === 'preclinicals'
    ? 'Pre-Clinicals Classes'
    : 'Private Tutorial';

  const rows = [
    ['Type', typeLabel],
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

/**
 * Operational alert to whoever runs the site. Returns whether it was sent, so
 * the health check can report a silent alerting channel rather than assuming
 * no news is good news — the failure mode this whole check exists to catch.
 */
export async function sendSystemAlert(opts: {
  issues: { severity: string; title: string; detail: string }[];
}): Promise<{ sent: boolean; reason?: string }> {
  const notifyEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!notifyEmail) return { sent: false, reason: 'ADMIN_NOTIFICATION_EMAIL is not set' };

  const { issues } = opts;
  if (issues.length === 0) return { sent: false, reason: 'nothing to report' };

  const critical = issues.filter((i) => i.severity === 'critical').length;

  const rows = issues
    .map(
      (i) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee;vertical-align:top">
            <span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase;
              background:${i.severity === 'critical' ? '#FDECEA' : '#FFF4E5'};
              color:${i.severity === 'critical' ? '#D93025' : '#B26A00'}">${i.severity}</span>
            <p style="margin:8px 0 4px;font-weight:600;color:#0B1120">${i.title}</p>
            <p style="margin:0;font-size:13px;color:#666;line-height:1.6">${i.detail}</p>
          </td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0B1120">
      <h2 style="color:#D93025;margin-bottom:4px">Site health check</h2>
      <p style="margin-top:0;color:#666">${issues.length} issue${issues.length === 1 ? '' : 's'} found${critical > 0 ? `, ${critical} critical` : ''}.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">${rows}</table>
      <p style="font-size:12px;color:#999;line-height:1.8">
        Sent by the daily health check. If this is unexpected, check the Vercel logs first.
      </p>
    </div>
  `;

  const ok = await send(notifyEmail, `[A-Star] ${critical > 0 ? 'Critical: ' : ''}${issues.length} health issue${issues.length === 1 ? '' : 's'}`, html);
  return ok ? { sent: true } : { sent: false, reason: 'Resend rejected or network error — see logs' };
}

export async function sendBuccRegistrationConfirmation(opts: { to: string; fullName: string }) {
  const { to, fullName } = opts;

  const joinBlock = BUCC_MEETING_URL
    ? `<p style="margin:24px 0">
         <a href="${BUCC_MEETING_URL}" style="background:#D93025;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;display:inline-block">Join the webinar</a>
       </p>
       <p style="font-size:13px;color:#666;line-height:1.6">Save this email — the same link works on the night.</p>`
    : `<p style="font-size:13px;color:#666;line-height:1.6">
         We'll send you the ${BUCC_PLATFORM} link a few hours before the session. Keep an eye on this inbox.
       </p>`;

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#0B1120">
      <h2 style="color:#D93025;margin-bottom:4px">You're registered 🎉</h2>
      <p style="margin-top:0;color:#666">Hi ${fullName}, your seat at ${BUCC_EVENT_NAME} is saved.</p>

      <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;width:40%">Event</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${BUCC_EVENT_NAME}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Theme</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee">${BUCC_TAGLINE}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Date</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${BUCC_DATE_LABEL}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Time</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${BUCC_TIME_LABEL}</td></tr>
        <tr><td style="padding:10px 0;color:#888">Where</td>
            <td style="padding:10px 0">${BUCC_PLATFORM} · ${BUCC_DURATION_LABEL}</td></tr>
      </table>

      ${joinBlock}

      <p style="font-size:13px;color:#666;line-height:1.6">
        Come with a pen. You'll hear from high-performing BUCC students on what 200 level actually
        demands, the study systems that work, and how to start the year ahead instead of catching up.
      </p>

      <p style="font-size:12px;color:#999;margin-top:32px;line-height:1.8">
        Please do not reply to this email.<br/>
        For help, WhatsApp us on <strong>0916 046 5678</strong> or email <a href="mailto:support@astartutorials.com" style="color:#D93025">support@astartutorials.com</a>.
      </p>
      <p style="font-size:12px;color:#aaa">A-Star Tutorials · astartutorials.com</p>
    </div>
  `;

  await send(to, `You're in — ${BUCC_EVENT_NAME}, ${BUCC_DATE_LABEL}`, html);
}
