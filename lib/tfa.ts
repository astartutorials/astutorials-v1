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
export const TFA_VENUE = "600-Seater Auditorium, Babcock University Teaching Hospital (BUTH)";
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
  { time: "11:45 AM – 12:00 PM", title: "Entertainment Segment" },
  { time: "12:00 – 12:05 PM", title: "Introduction of the Keynote Speaker" },
  { time: "12:05 – 12:35 PM", title: "Keynote Address", highlight: true },
  { time: "12:35 – 12:50 PM", title: "Second Sponsor Presentation" },
  { time: "12:50 – 1:05 PM", title: "Entertainment Segment" },
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

export const TFA_HEARD_OPTIONS = [
  "WhatsApp",
  "Instagram",
  "A friend or coursemate",
  "An association / class rep",
  "A-Star Ambassador",
  "Flyer on campus",
  "Other",
];
