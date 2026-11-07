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

/** The event flyer: homepage band, /tfa and the link preview on WhatsApp etc. */
export const TFA_FLYER = {
  src: "/tfa/flyer.jpg",
  width: 1063,
  height: 1280,
  alt: "The Freshers' Advantage 2.0 flyer. Theme: Equipped For Success. Convener Paul Upah, keynote speaker Dr. Uchenna Aguocha-Ohiagbaji and eight student-leader panellists. 8th November 2026, 10:00 AM, 600 Seater Auditorium, BUTH. Over 1 million naira worth of gifts to be won.",
};

/**
 * Registration stays open until the event ends (15:00 WAT = 14:00 UTC), so a
 * fresher can still sign up from a QR code at the door.
 */
export const TFA_CLOSES_AT = new Date("2026-11-08T14:00:00Z");

export function isTfaOpen(now: Date = new Date()): boolean {
  return now <= TFA_CLOSES_AT;
}

export type TfaPerson = { name: string; role: string };

/**
 * A speaker's card shows the photo, name and role; the bio opens in a dialog
 * on tap, so long bios cost the page no height. Photos are 480px square crops
 * in public/tfa/panellists. Bios are the speakers' own words, lightly
 * copy-edited (typos, a duplicated paragraph); one string per paragraph.
 */
export type TfaPanellist = TfaPerson & { photo: string; bio: string[] };

const photo = (slug: string) => `/tfa/panellists/${slug}.jpg`;

export const TFA_KEYNOTE: TfaPanellist & { note: string } = {
  name: "Dr. Uchenna Aguocha-Ohiagbaji",
  role: "Medical Doctor & Serial Entrepreneur",
  note: "Babcock Alum",
  photo: photo("aguocha"),
  bio: [
    "Dr. Uchenna Uzoma Ezeigbo Aguocha-Ohiagbaji, popularly known as Dr. Uche Aguocha, is a second-generation medical doctor, entrepreneur, and personal finance and business coach.",
    "He is the founder of Eduhub Nigeria, The Finance Village, Citytop Media, and Leomart Storage & Transport, and co-founder of Agrovault, A-Star Tutorials, Code-It Technologies, and Gold Plate.",
    "As a personal finance and business coach, Dr. Uche equips individuals with the knowledge and practical skills to manage their finances, make smarter financial decisions, and build additional income streams. He also helps entrepreneurs structure, strengthen, and grow sustainable businesses.",
    "Passionate about knowledge sharing, youth development, and entrepreneurship, Dr. Uche is committed to empowering the next generation with the knowledge, skills, and opportunities to create meaningful impact and contribute to Africa's development.",
  ],
};

export const TFA_CONVENER: TfaPanellist = {
  name: "Paul Olabode Upah",
  role: "CEO, A-Star Tutorials",
  photo: photo("upah"),
  bio: [
    "Paul Olabode Upah is an entrepreneur, educational innovator and emerging business leader. He is the co-founder and CEO of A-Star Tutorials, co-founder of Gold Plate, and COO and co-owner of Leomart Storage & Transport.",
    "Currently a Biochemistry student at Babcock University, Paul aspires to become a medical doctor. He is passionate about entrepreneurship, education, leadership, technology and youth development.",
    "Through his ventures, Paul is committed to building sustainable institutions, developing people, and creating opportunities that promote academic excellence, entrepreneurial growth and human capacity development. Driven by a vision to empower young people to realise their potential, he is particularly passionate about contributing to the development of individuals, institutions and society at large.",
  ],
};

export const TFA_PANELLISTS: TfaPanellist[] = [
  {
    name: "Michael Ubajekwe",
    role: "Chairman, Premier Council & President, POLSSA",
    photo: photo("ubajekwe"),
    bio: [
      "Ubajekwe Michael Chidubem is a 400-level Political Science student at Babcock University, currently serving as President-Chairperson of the Babcock University Premier Council (BUPC) and President of the Political Science Students Association (POLSSA).",
      "Beyond student leadership, he is a co-promulgator of the Make Nigeria Gigantic Again (MNGA) Movement, which promotes patriotism and national consciousness among Nigerian youths.",
      "A passionate advocate for diplomacy and international relations, Michael is an active member of the Babcock International Model United Nations (BIMUN), where he won Best Delegate in SPECPOL at BIMUN 2025 and emerged as Overall Best Campus Ambassador at BIMUN 2026.",
      "His interests also extend to the creative arts, particularly acting and stage drama, and he serves as the Vice-President of Save Souls.",
      "Driven by a commitment to leadership, diplomacy, patriotism and creativity, Michael aspires to make meaningful contributions to society and inspire positive change wherever he finds himself.",
    ],
  },
  {
    name: "Oghenetejiri Efegherimoni",
    role: "President, BUCC",
    photo: photo("efegherimoni"),
    bio: [
      "Efegherimoni Oghenetejiri is a 400-level Software Engineering student at Babcock University and the current President of the Babcock University Computer Club (BUCC). She is passionate about technology and marketing.",
      "Over the years, she has been actively involved in various campus initiatives, student communities and leadership roles, where she has developed an interest in building communities, creating opportunities and making meaningful impact. She is particularly interested in exploring how technology, communication and people come together to drive growth and change.",
    ],
  },
  {
    name: "Okiemute Akpe",
    role: "Vice-President, PUHSA",
    photo: photo("akpe"),
    bio: [
      "Akpe Okiemute is a Public Health undergraduate at Babcock University, a student leader, and a Commonwealth Students’ Association (CSA) Campus Ambassador. She currently serves as the Vice President of the Public Health Students’ Association (PUHSA), where she oversees academic welfare and initiatives that promote student development and academic excellence.",
      "With experience in student representation, leadership, advocacy and community engagement, she is passionate about public health, effective communication, youth development and creating meaningful impact. She also has a keen interest in digital media, content creation and creative communication.",
    ],
  },
  {
    name: "Elizabeth Asha",
    role: "Vice-President, BUNSA",
    photo: photo("asha"),
    bio: [
      "Asha Oluwafeyisayo is a first-class 500-level Nursing student, a former BUSA senator, and the current Vice President of the Babcock University Nursing Students’ Association. She’s a blend of two cultures and a solid advocate for children’s and women’s rights.",
      "A lover of God, she is the assistant HOD and welfare director of the Sabbath School department at HOKC. She believes that life is more than what we make it. She has failed multiple times but has never let that stop her. She dreams of making a name in politics and aspires to lose herself in the service of others.",
    ],
  },
  {
    name: "Ebose Eseigbe",
    role: "President, BUESA",
    photo: photo("eseigbe"),
    bio: [
      "Eseigbe Ebosemare Jotham is a 400-level Computer Engineering student at Babcock University with a deep interest in technology and in advances in circuit theory. He is the kind of student who turns curiosity into practice, and he has built a record of leadership alongside his studies.",
      "He is the President of the Babcock University Engineering Student Association, a role he has held for two and a half years. He also chairs the IEEE Babcock University Student Branch, where he helps students connect with the wider engineering community. At the national level, he has served as General Secretary of the National Association of Computer Engineering Students (South-West Zone).",
      "Beyond engineering, he has kept a healthy balance in his life. He is the chaplain of the Iperu Art Group, and he enjoys acting, sports, gaming, anime and going to the gym. For him, success at university is about growing as a whole person and not only about grades.",
    ],
  },
  {
    name: "Juanita Ken-Morrison",
    role: "President, MCSA",
    photo: photo("ken-morrison"),
    bio: [
      "Juanita Ken-Morrison Biaka is a student leader, communication enthusiast and emerging media professional with a keen interest in leadership, strategic communication, youth development and social impact. She is a 400-level Mass Communication student at Babcock University, Nigeria, specialising in Public Relations and Advertising. She maintains a First-Class academic standing while actively engaging in leadership, professional development and extracurricular activities.",
      "She currently serves as the President of the Mass Communication Students Association (MCSA), Babcock University, the Deputy Chairperson of the Premier Council, and the General Secretary of the Babcock Creators Network (BCN). Through these leadership responsibilities, she contributes to student representation, institutional engagement, creative development and initiatives that encourage collaboration and professional growth among young people.",
      "Her leadership journey reflects a commitment to balancing academic excellence with organisational responsibilities, personal development and active participation in university life. She is particularly passionate about inclusive leadership, effective communication, amplifying student voices and creating platforms that empower young people to recognise and develop their potential.",
      "Beyond her leadership engagements, Juanita has gained practical media experience through her internship at BusinessDay, where she developed competencies in journalism, news writing, research and professional media practice.",
      "She believes that leadership extends beyond titles and positions; it is demonstrated through responsibility, service, intentional action and the ability to create meaningful opportunities for others. Outside her academic and leadership commitments, she enjoys dancing, socialising, exploring creative interests and embracing experiences that make life both meaningful and enjoyable.",
    ],
  },
  {
    name: "Oluwatomilola Adedapo",
    role: "Vice-President, BUAMS",
    photo: photo("adedapo"),
    bio: [
      "Growing up, Adedapo Oluwatomilola Elizabeth, publicly known as Tomi, was instilled with a deep sense of discipline and an unwavering drive for excellence. A naturally outspoken child with a deep love for the creative arts and hands-on projects, she consistently demonstrated an instinct to step up and lead without waiting for permission. From early days, Tomi knew medicine was her undisputed calling, drawing inspiration from healthcare trailblazers.",
      "Navigating the rigorous demands of medical education at Babcock University, Tomi conquered her demanding MB professional examinations through sheer discipline, committing to her preparation even when exhausted. While the unpredictable nature of clinical ward rounds challenged her strict routines, she adapted by drawing motivation from driven peers. She maintains a core belief that medicine is the pinnacle of professional service, balancing clinical objectivity with the empathy of someone who understands she could easily be in the patient’s shoes.",
      "Tomi approaches leadership with precision, guided by the principle that her academic goals must never suffer while she builds a well-rounded character. She built her reputation beginning as Deputy Sports Director. Her crowning achievement as the current Vice President of BUAMS was being the chairlady of the BUAMS Health Week 2026, delivering tangible healthcare outreach to the local community while enriching the student experience.",
      "Beyond the hospital, Tomi leverages her talent for strategic communication and digital design. Looking forward, Tomi has realised her greatest impact lies beyond individual clinical practice. Over the next few years, she intends to pivot towards health policy and advocacy to champion the overhaul of Nigerian healthcare policies. Driven by a deep commitment to the people she serves, Tomi is discovering her legacy by building sustainable healthcare structures designed to outlast her tenure.",
    ],
  },
  {
    name: "Olamide Oyesanwen",
    role: "President, BUASA",
    photo: photo("oyesanwen"),
    bio: [
      "Oyesanwen Olamide Abel is a final-year Architecture student at Babcock University, an emerging architectural professional with interests in innovative design, sustainable development and the built environment. He serves as President of the Babcock University Architecture Students Association (2024–present), bringing experience in leadership, administration and team coordination.",
      "With practical industry exposure and a growing foundation in architectural practice, he is driven by a commitment to design excellence, continuous development, and creating meaningful architectural solutions that positively impact people and communities.",
    ],
  },
];

/**
 * The main 100L WhatsApp group. Where the success page and the confirmation
 * email send everyone once they've registered.
 */
export const TFA_WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/DTvsNnfMDsDHinA896foHM?mode=gi_t";

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
  "Direct Entry Student",
  "Transfer Student",
  "Returning Student",
  "Parent / Guardian",
] as const;

/**
 * Options the form offered before they were split or dropped (6 Nov 2026).
 * Early registrations still carry them, so the admin page keeps a filter for
 * each; the API no longer accepts them.
 */
export const TFA_LEGACY_ATTENDEE_TYPES = ["Direct Entry / Transfer student", "Returning student", "Other"];

/** The attendee type that is itself the parent: no separate parent name or phone is asked for. */
export const TFA_PARENT_TYPE = "Parent / Guardian";

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
