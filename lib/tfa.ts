/**
 * Single source of truth for The Freshers' Advantage 2.0 — A-Star's free,
 * in-person orientation event for Babcock freshers.
 *
 * The landing page (/tfa), the registration form, the success page, the
 * confirmation email and the Programmes menu all read from here, so a date,
 * venue or speaker change lands everywhere at once.
 *
 * To run another edition: update the dates, programme and speakers below.
 */
export const TFA_EVENT_NAME = "The Freshers' Advantage 2.0";
export const TFA_THEME = "Equipped for Success";

export const TFA_DATE_LABEL = "Sunday, 8th November 2026";
export const TFA_TIME_LABEL = "10:00 AM – 3:00 PM";
export const TFA_VENUE =
  "600-Seater Auditorium, Babcock University Teaching Hospital (BUTH), Ilishan-Remo, Ogun State";
export const TFA_VENUE_SHORT = "600-Seater Auditorium, BUTH";

/**
 * Registration stays open until the event ends (15:00 WAT = 14:00 UTC), so a
 * fresher can still sign up from a QR code at the door.
 */
export const TFA_CLOSES_AT = new Date("2026-11-08T14:00:00Z");

export function isTfaOpen(now: Date = new Date()): boolean {
  return now <= TFA_CLOSES_AT;
}

export type TfaPerson = { name: string; role: string };

export const TFA_KEYNOTE: TfaPerson & { note: string } = {
  name: "Dr. Uchenna Aguocha-Ohiagbaji",
  role: "Medical Doctor & Serial Entrepreneur",
  note: "Babcock Alum",
};

export const TFA_CONVENER: TfaPerson = {
  name: "Paul Olabode Upah",
  role: "CEO, A-Star Tutorials",
};

export const TFA_PANELLISTS: TfaPerson[] = [
  { name: "Michael Ubajekwe", role: "Chairman, Premier Council & President, POLSSA" },
  { name: "Oghenetejiri Efegherimoni", role: "President, BUCC" },
  { name: "Okiemute Akpe", role: "Vice-President, PUHSA" },
  { name: "Elizabeth Asha", role: "Vice-President, BUNSA" },
  { name: "Ebose Eseigbe", role: "President, BUESA" },
  { name: "Juanita Ken-Morrison", role: "President, MCSA" },
  { name: "Oluwatomilola Adedapo", role: "Vice-President, BUAMS" },
  { name: "Olamide Oyesanwen", role: "President, BUASA" },
];

export type TfaSlot = { time: string; title: string; highlight?: boolean };

export const TFA_PROGRAMME: TfaSlot[] = [
  { time: "10:00 – 10:30 AM", title: "Arrival and Registration of Attendees" },
  { time: "10:30 – 10:40 AM", title: "Opening Prayer" },
  { time: "10:40 – 10:50 AM", title: "Welcome Address by the CEO, A-Star Tutorials" },
  { time: "10:50 – 11:00 AM", title: "Introduction of First Panellists" },
  { time: "11:00 – 11:30 AM", title: "First Panel Session", highlight: true },
  { time: "11:30 – 11:45 AM", title: "First Sponsor Presentation" },
  { time: "11:45 AM – 12:00 PM", title: "Entertainment: Magician" },
  { time: "12:00 – 12:05 PM", title: "Introduction of the Keynote Speaker" },
  { time: "12:05 – 12:35 PM", title: "Keynote Address", highlight: true },
  { time: "12:35 – 12:50 PM", title: "Second Sponsor Presentation" },
  { time: "12:50 – 1:05 PM", title: "Entertainment: Dance Group" },
  { time: "1:05 – 1:15 PM", title: "Introduction of Second Panellists" },
  { time: "1:15 – 1:45 PM", title: "Second Panel Session", highlight: true },
  { time: "1:45 – 2:00 PM", title: "Third Sponsor Presentation" },
  { time: "2:00 – 2:15 PM", title: "Introduction of Semester Packages" },
  { time: "2:15 – 2:30 PM", title: "Announcement and Unveiling of A-Star Ambassadors", highlight: true },
  { time: "2:30 – 2:40 PM", title: "Closing Remarks and Vote of Thanks" },
  { time: "2:40 – 2:45 PM", title: "Closing Prayer" },
  { time: "2:45 – 3:00 PM", title: "Group Photograph, Networking and Departure" },
];

/** Who is filling in the form. Stored as the value; also the API's allow-list. */
export const TFA_ATTENDEE_TYPES = [
  "Fresher (100 Level)",
  "Direct Entry / Transfer student",
  "Returning student",
  "Parent / Guardian",
  "Other",
] as const;

/** The six things the day offers: one line each, for the "What to expect" strip. */
export const TFA_HIGHLIGHTS = [
  { title: "Panel Discussions", desc: "Student leaders on getting through university and doing well." },
  { title: "Keynote Address", desc: "Personal development, preparation and success." },
  { title: "Entertainment", desc: "A magician and a dance group." },
  { title: "Sponsor Showcases", desc: "Brands, products and services for students." },
  { title: "Semester Packages", desc: "The academic support A-Star offers this semester." },
  { title: "A-Star Ambassadors", desc: "The unveiling of our student ambassadors." },
];

/**
 * Who a question can be addressed to. The keynote, convener and each panellist
 * by name, plus a catch-all. Also the API's allow-list for `questionFor`.
 */
export const TFA_ANY_SPEAKER = "Any speaker";
export const TFA_QUESTION_TARGETS: string[] = [
  TFA_ANY_SPEAKER,
  `${TFA_KEYNOTE.name} (Keynote)`,
  `${TFA_CONVENER.name} (Convener)`,
  ...TFA_PANELLISTS.map((p) => `${p.name} (${p.role})`),
];

/** Event start/end in UTC, for add-to-calendar links (10:00–15:00 WAT). */
export const TFA_STARTS_AT = new Date("2026-11-08T09:00:00Z");
export const TFA_ENDS_AT = TFA_CLOSES_AT;

export const TFA_HEARD_OPTIONS = [
  "WhatsApp",
  "Instagram",
  "A friend or coursemate",
  "An association / class rep",
  "A-Star Ambassador",
  "Flyer on campus",
  "Other",
];

const TFA_URL = "https://astartutorials.com/tfa";
const TFA_CAL_DETAILS = `Theme: ${TFA_THEME}. Panel sessions, a keynote address, entertainment and the unveiling of the A-Star Ambassadors. ${TFA_URL}`;

/** 20261108T090000Z — the compact UTC form both Google Calendar and iCalendar use. */
function calStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function tfaGoogleCalendarUrl(): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: TFA_EVENT_NAME,
    dates: `${calStamp(TFA_STARTS_AT)}/${calStamp(TFA_ENDS_AT)}`,
    details: TFA_CAL_DETAILS,
    location: TFA_VENUE,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** An .ics file for Apple Calendar / Outlook. Commas and semicolons escaped per RFC 5545. */
export function tfaIcs(): string {
  const esc = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//A-Star Tutorials//TFA//EN",
    "BEGIN:VEVENT",
    "UID:tfa-2026@astartutorials.com",
    `DTSTAMP:${calStamp(TFA_STARTS_AT)}`,
    `DTSTART:${calStamp(TFA_STARTS_AT)}`,
    `DTEND:${calStamp(TFA_ENDS_AT)}`,
    `SUMMARY:${esc(TFA_EVENT_NAME)}`,
    `DESCRIPTION:${esc(TFA_CAL_DETAILS)}`,
    `LOCATION:${esc(TFA_VENUE)}`,
    `URL:${TFA_URL}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export const TFA_SHARE_TEXT = `I'm going to ${TFA_EVENT_NAME}: ${TFA_THEME}. ${TFA_DATE_LABEL}, ${TFA_TIME_LABEL} at the ${TFA_VENUE_SHORT}. It's free, register here: ${TFA_URL}`;
