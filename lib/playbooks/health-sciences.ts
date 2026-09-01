import type { Playbook } from "./types";

/**
 * THE HEALTH SCIENCES PLAYBOOK — "What They Don't Teach You About Thriving in
 * 200 Level."
 *
 * The one playbook aimed at a single year rather than a whole degree, which is
 * why its feature block is a 100 → 200 shift rather than a skills grid.
 *
 * ⚠️ Still outstanding: paste the Google Meet link into NEXT_PUBLIC_HEALTH_SCIENCES_MEETING_URL.
 * While it is empty the page and the confirmation email both say we'll send
 * the link nearer the time, which is true and better than a dead link.
 *
 * `dateLabel` and `closesAt` must always describe the same instant — the
 * label is what students read, and closesAt is what shuts registration. A
 * test in __tests__/lib/playbooks.test.ts holds the two together.
 */
export const healthSciences: Playbook = {
  slug: "health-sciences",
  name: "The Health Sciences Playbook",
  shortName: "Health Sciences",
  tagline: "What They Don't Teach You About Thriving in 200 Level",
  promise: "Excel academically. Build yourself. Prepare for what's next.",
  forWho:
    "For 200-level students in Nursing, Anatomy, Physiology, Biochemistry, Public Health & related disciplines",
  navBlurb: "Free 90-minute webinar for 200-level Health Sciences",

  accent: "health-sciences",
  motif: "pulse",

  dateLabel: "Friday, 11th September 2026",
  timeLabel: "6:00 pm WAT",
  durationLabel: "90 minutes",
  platform: "Google Meet",
  meetingUrl: process.env.NEXT_PUBLIC_HEALTH_SCIENCES_MEETING_URL ?? "",
  // 18:00 WAT = 17:00 UTC.
  closesAt: new Date("2026-09-11T17:00:00Z"),

  bigLine:
    "100 level introduced you to university. 200 level is where it starts asking for something back.",

  questions: [
    {
      q: "What actually changes?",
      a: "An honest account of the step up: the volume, the pace, the courses that humble everyone, and the habits from 100 level that stop working immediately.",
    },
    {
      q: "How do I stay ahead?",
      a: "How to handle large volumes of material, when memorising is right and when it's fatal, and how top students prepare for tests, exams and practicals.",
    },
    {
      q: "How do I build a future too?",
      a: "200 level is early enough that research, skills, leadership and clinical exposure still compound. Where they fit, and how much they cost you.",
    },
  ],

  bigIdeaParas: [
    "100 level was an introduction. Everyone told you it was hard, and then it mostly wasn't.",
    "200 level does not work like that. The course load roughly doubles, the material stops being general, and Anatomy, Physiology and Biochemistry arrive at the same time with more content in a week than 100 level gave you in a month.",
    "Most students don't fail because they stopped working. They fail because they kept using a 100-level method on a 200-level workload, and only found out at the first test.",
    "This is 90 minutes with students who have already been through it — what they changed, what they wish they'd changed sooner, and what they'd do differently on day one.",
  ],
  closingLine: "The speakers bring the experience. A-Star brings the structure.",

  segments: [
    { time: "0–5", title: "Speakers' Introduction", purpose: "Departments, results and what makes each perspective useful" },
    { time: "5–65", title: "The Health Sciences Playbook", purpose: "Three 20-minute deep dives, every speaker on every topic" },
    { time: "65–75", title: "Q&A", purpose: "Curated student questions, directed to the right speaker" },
    { time: "75–90", title: "The A-Star Advantage", purpose: "The structure that turns the advice into a habit" },
  ],

  topics: [
    {
      time: "5–25",
      title: "How to excel academically in 200 level",
      prompt:
        "100 level is behind you. 200 level comes with a different academic reality. So how do you actually stay ahead?",
      covers: [
        "What changes from 100 to 200",
        "A heavier course load",
        "Large volumes of information",
        "Difficult concepts",
        "Memorisation vs. understanding",
        "Note-taking",
        "Active recall & revision",
        "Past questions",
        "Tests & examinations",
        "The courses that humble everyone",
        "Mistakes they made in first semester",
      ],
      takeaway: "Not “study harder”. Here's exactly how I approached my 200-level courses.",
    },
    {
      time: "25–45",
      title: "Building yourself beyond academics",
      prompt:
        "Your 200-level results matter, but your university experience should be building more than a transcript. What should students start developing now?",
      covers: [
        "Research skills",
        "Digital & technology skills",
        "Communication",
        "Public speaking",
        "Leadership",
        "Networking",
        "Internships",
        "Volunteering",
        "Certifications",
        "Career exploration",
      ],
      takeaway:
        "If I were starting 200 level again, this is what I would start building immediately.",
    },
    {
      time: "45–65",
      title: "Balancing academics & personal development",
      prompt:
        "We've established what it takes to succeed academically and what students should be building outside the classroom. But how do you realistically do both?",
      covers: [
        "Time management",
        "Prioritisation",
        "Realistic schedules",
        "Demanding courses",
        "Consistency",
        "Choosing opportunities wisely",
        "Avoiding burnout",
        "Social commitments",
        "Protecting your results",
        "Productivity in a bad week",
      ],
      takeaway:
        "You don't have to sacrifice academic excellence to develop yourself. You need a system where both grow together.",
    },
  ],

  feature: {
    eyebrow: "The Step Up",
    title: "What actually changes between 100 and 200 level",
    blurb:
      "The first segment opens here. Not to frighten anybody — to make the specific change visible, so you can adjust before a test tells you to.",
    layout: "shift",
    items: [
      { label: "Read the slides the night before", note: "Reviewing each lecture within 24 hours, because there is no night before big enough" },
      { label: "Remember it", note: "Understand the mechanism — 200-level questions ask you to apply it, not recite it" },
      { label: "Revise before the test", note: "Active recall on a schedule, so week 3 still exists in your head in week 12" },
      { label: "One or two hard courses", note: "Anatomy, Physiology and Biochemistry running at full weight simultaneously" },
      { label: "Written tests", note: "Practicals and spotters, which reward a completely different kind of preparation" },
      { label: "Study when you feel behind", note: "A timetable decided in advance, so the decision isn't made at 11pm by how tired you are" },
    ],
  },

  qaQuestions: [
    "How many hours should I study daily in 200 level?",
    "How do I handle the increase in workload?",
    "How do I memorise large volumes of information?",
    "How do I study Anatomy effectively?",
    "How do I approach Biochemistry and Physiology?",
    "How do I prepare for practical examinations?",
    "How do I use past questions properly?",
    "What skills should I start building in 200 level?",
    "How do I find relevant opportunities?",
    "How do I avoid burnout?",
    "What should I do if I've already fallen behind?",
    "What would you do differently if you were starting 200 level again?",
  ],

  moderatorRule: {
    vague: "You just need to manage your time.",
    followUp:
      "What did that actually look like for you in 200 level? Walk us through a typical week.",
  },

  speakers: [
    {
      name: "Image Chioma",
      discipline: "Medical Laboratory Science",
      role: "President, MEDLAB · Gen. Sec., Premier Council",
    },
    { name: "Asha Feyi", discipline: "Nursing", role: "Vice President, Nursing" },
    { name: "Ibukun Philips", discipline: "Public Health", role: "PRO, BUSA" },
  ],
  moreSpeakersToCome: true,

  speakerStrategy: [
    { label: "The academic", desc: "A strong 200-level performer who can explain the method, not just show the result." },
    { label: "The developer", desc: "Research, skills or professional development alongside a demanding course load." },
    { label: "The balancer", desc: "Academics and growth at the same time — and honest about the trade-offs." },
    { label: "The journey", desc: "A student whose academic or career path took a turn worth hearing about." },
  ],

  advantage: {
    name: "A-Star Health Sciences Tutorials",
    intro:
      "Tonight you've heard what successful students do. Knowing what to do and having the structure to consistently do it are two different things.",
    items: [
      "Live tutorials",
      "Experienced tutors",
      "Difficult-topic breakdowns",
      "Curated learning resources",
      "Past questions",
      "Quizzes",
      "Revision sessions",
      "Mock examinations",
      "Academic tracking",
      "Accountability",
    ],
    positioning:
      "A-Star helps students turn the strategies they've learnt tonight into a consistent academic system.",
    startsOn: "17th September 2026",
  },

  audience: [
    "200-level students in Nursing, Anatomy, Physiology, Biochemistry, Public Health and related disciplines",
    "100-level students who want to arrive prepared rather than surprised",
    "Students whose 100-level result was fine but not what they wanted",
    "Anyone who already feels behind and needs a way back",
    "Students who want to build something beyond a transcript",
  ],

  form: {
    levels: ["100 Level (incoming 200)", "200 Level", "300 Level", "400 Level", "Other"],
    disciplineLabel: "Department",
    disciplines: [
      "Nursing",
      "Anatomy",
      "Physiology",
      "Biochemistry",
      "Public Health",
      "Medical Laboratory Science",
      "Medicine & Surgery",
      "Physiotherapy",
      "Radiography",
      "Pharmacy",
      "Other Health Sciences department",
    ],
    academicChallengeLabel: "Your biggest academic challenge in 200 level",
    academicChallengePlaceholder:
      "Be specific — “I understand it in the lecture and it's gone by the weekend” is more useful than “too much material”.",
    otherChallengeLabel: "Your biggest challenge outside academics",
    otherChallengePlaceholder:
      "e.g. I want to get into research but I don't know who to ask.",
    questionLabel: "What would you ask a high-performing Health Sciences student?",
    questionPlaceholder: "The strongest questions get answered live during the Q&A.",
    heardOptions: [
      "A coursemate",
      "Class or department group",
      "Instagram",
      "X (Twitter)",
      "TikTok",
      "WhatsApp",
      "An A-Star tutor",
      "Other",
    ],
  },

  metaDescription:
    "A free 90-minute academic and mentorship webinar for 200-level Health Sciences students — Nursing, Anatomy, Physiology, Biochemistry, Public Health and related disciplines. Friday, 11th September 2026, 6:00 pm WAT.",
  ogDescription:
    "100 level introduced you to university. 200 level asks for something back. Free 90-minute webinar — Friday, 11th September 2026, 6:00 pm.",
};
