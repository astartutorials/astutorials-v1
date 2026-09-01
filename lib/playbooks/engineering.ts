import type { Playbook } from "./types";

/**
 * THE ENGINEERING PLAYBOOK — "What They Don't Teach You About Succeeding in
 * Engineering."
 *
 * Everything on /playbooks/engineering, in the confirmation email and in the
 * admin console reads from here.
 *
 * ⚠️ Still outstanding: paste the Google Meet link into NEXT_PUBLIC_ENGINEERING_MEETING_URL.
 * While it is empty the page and the confirmation email both say we'll send
 * the link nearer the time, which is true and better than a dead link.
 *
 * `dateLabel` and `closesAt` must always describe the same instant — the
 * label is what students read, and closesAt is what shuts registration. A
 * test in __tests__/lib/playbooks.test.ts holds the two together.
 */
export const engineering: Playbook = {
  slug: "engineering",
  name: "The Engineering Playbook",
  shortName: "Engineering",
  tagline: "What They Don't Teach You About Succeeding in Engineering",
  promise: "Study effectively. Build relevant skills. Become industry-ready.",
  forWho: "For Engineering undergraduates across every discipline",
  navBlurb: "Free 90-minute webinar for Engineering students",

  accent: "engineering",
  motif: "blueprint",

  dateLabel: "Sunday, 13th September 2026",
  timeLabel: "6:00 pm WAT",
  durationLabel: "90 minutes",
  platform: "Google Meet",
  meetingUrl: process.env.NEXT_PUBLIC_ENGINEERING_MEETING_URL ?? "",
  // 18:00 WAT = 17:00 UTC.
  closesAt: new Date("2026-09-13T17:00:00Z"),

  bigLine:
    "Your degree is the foundation. It was never meant to be the whole career.",

  questions: [
    {
      q: "How do I actually study this?",
      a: "Engineering doesn't reward memorising. You'll get the specific approach high performers take from the first lecture of a course to the morning of the exam.",
    },
    {
      q: "What should I be building?",
      a: "Code, CAD, simulation, data, technical writing, real projects. Which ones matter, which order to learn them in, and what a student portfolio should actually contain.",
    },
    {
      q: "How do I do both at once?",
      a: "The honest part. How to build skills on the side without your CGPA quietly paying for it — and without burning out by week six.",
    },
  ],

  bigIdeaParas: [
    "Engineering students are told to work hard. They are rarely told how.",
    "So the failure mode is predictable: you attend every lecture, you read the slides, you cram the past questions, and the calculation in the exam still looks nothing like the one you practised.",
    "Meanwhile the students who are getting internships and building things aren't necessarily smarter. They just started earlier, and they had a system.",
    "This is 90 minutes with students who are already doing both well — the study approach, the technical skills, and the schedule that lets the two coexist.",
  ],
  closingLine: "The speakers bring the experience. A-Star brings the structure.",

  segments: [
    { time: "0–5", title: "Speakers' Introduction", purpose: "Who you're learning from, and why their experience matters" },
    { time: "5–65", title: "The Engineering Playbook", purpose: "Three 20-minute deep dives, every speaker on every topic" },
    { time: "65–75", title: "Q&A", purpose: "Curated student questions, directed to the right speaker" },
    { time: "75–90", title: "The A-Star Advantage", purpose: "The structure that turns the advice into a habit" },
  ],

  topics: [
    {
      time: "5–25",
      title: "How to study effectively in Engineering",
      prompt:
        "Engineering demands more than memorising information. So how do you actually study effectively when you're dealing with calculations, concepts, practicals and difficult courses?",
      covers: [
        "How they approach lectures",
        "Understanding over memorising",
        "Working problems",
        "Difficult calculations",
        "Textbooks & lecture materials",
        "Past questions",
        "Revision",
        "Group study",
        "Surviving the killer courses",
        "Exam preparation",
        "The mistakes they made",
      ],
      takeaway:
        "This is exactly how I approach an Engineering course, from the first lecture to examination day.",
    },
    {
      time: "25–45",
      title: "Building technical & industry-relevant skills",
      prompt:
        "A degree can give you a foundation, but Engineering is a practical profession. What skills should students start building before they graduate?",
      covers: [
        "Programming",
        "CAD & design tools",
        "Data analysis",
        "Simulation software",
        "Technical writing",
        "Research",
        "Project development",
        "Certifications",
        "Internships",
        "Professional communities",
        "Personal projects",
        "Portfolio",
      ],
      takeaway:
        "If I were starting Engineering again today, these are the skills I would start building immediately.",
    },
    {
      time: "45–65",
      title: "Balancing academics with skill development",
      prompt:
        "So we've established that students need academic excellence and practical skills. But how do you actually build both without one destroying the other?",
      covers: [
        "Time management",
        "Prioritisation",
        "Realistic schedules",
        "Coursework & projects",
        "Learning consistently",
        "Choosing opportunities",
        "Avoiding burnout",
        "Academic pressure",
        "Staying consistent",
        "Protecting your CGPA",
      ],
      takeaway:
        "You don't have to choose between being an excellent student and becoming an excellent Engineer. You need a system that grows both.",
    },
  ],

  feature: {
    eyebrow: "The Skills Stack",
    title: "What to start building, and roughly in what order",
    blurb:
      "Nobody learns all of this at once. Segment two is about sequencing — what earns its place first, what can wait, and what a portfolio needs to actually show.",
    layout: "grid",
    items: [
      { label: "Programming", note: "The one skill that compounds into every other discipline — simulation, analysis, automation, hardware." },
      { label: "CAD & design tools", note: "Where an idea becomes a drawing somebody else can build. Discipline-specific, and expected." },
      { label: "Data analysis", note: "Reading results honestly. The difference between a measurement and a conclusion." },
      { label: "Simulation", note: "Testing a design before it costs anything. What separates a sketch from an engineering proposal." },
      { label: "Technical writing", note: "The most under-rated skill on this list. Work nobody can read is work nobody can use." },
      { label: "A portfolio", note: "Three projects you can explain end to end beat a list of twelve you can't." },
    ],
  },

  qaQuestions: [
    "How many hours should I study daily?",
    "How do I understand the courses everyone says are impossible?",
    "Should I prioritise CGPA or technical skills?",
    "Which technical skill should I learn first?",
    "How do I get started with projects when I don't know enough yet?",
    "How do I balance coding with my Engineering courses?",
    "Are certifications actually worth it?",
    "How do I find internships as an undergraduate?",
    "What should I do if I'm already struggling academically?",
    "What would you do differently if you were starting Engineering again?",
  ],

  moderatorRule: {
    vague: "You just need to practise more.",
    followUp:
      "Practise what, exactly? How did you practise, and how did you know you were improving?",
  },

  speakers: [
    { name: "Ebose" },
    { name: "Odogun Angel" },
  ],
  moreSpeakersToCome: true,

  speakerStrategy: [
    { label: "The academic", desc: "A consistently strong performer who can explain how they actually approach a course." },
    { label: "The builder", desc: "Strong technical and industry skills — projects, tools, internships, real output." },
    { label: "The balancer", desc: "Academics, skills and extracurriculars at the same time, without dropping any of them." },
    { label: "The professional", desc: "Leadership, competitions or industry exposure — and what that opened up." },
  ],

  advantage: {
    name: "A-Star Engineering Tutorials",
    intro:
      "You've now heard what successful Engineering students do. Knowing what to do is very different from having the structure to consistently do it.",
    items: [
      "Live tutorials",
      "Tutors who took the same courses",
      "Difficult-course breakdowns",
      "Practice questions",
      "Past questions",
      "Weekly quizzes",
      "Revision sessions",
      "Mock examinations",
      "Academic tracking",
      "Examination preparation",
    ],
    positioning:
      "A-Star helps students build the academic structure required to understand their courses, practise consistently and perform when it matters.",
    startsOn: "17th September 2026",
  },

  audience: [
    "Engineering students in any discipline who want a method, not motivation",
    "Students whose results are fine but not what they're capable of",
    "Anyone who knows they should be building something and hasn't started",
    "Students who keep choosing between their CGPA and their skills",
    "Final-year students who want to graduate industry-ready, not just qualified",
  ],

  form: {
    levels: ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "Graduate / Other"],
    disciplineLabel: "Engineering Discipline",
    disciplines: [
      "Mechanical Engineering",
      "Electrical / Electronics Engineering",
      "Civil Engineering",
      "Chemical Engineering",
      "Computer Engineering",
      "Mechatronics Engineering",
      "Petroleum / Gas Engineering",
      "Agricultural / Biosystems Engineering",
      "Industrial / Production Engineering",
      "Biomedical Engineering",
      "Other Engineering discipline",
    ],
    academicChallengeLabel: "Your biggest academic challenge right now",
    academicChallengePlaceholder:
      "Be specific — \"I can follow the lecture but I freeze on the calculations\" is more useful than \"maths\".",
    otherChallengeLabel: "Your biggest technical or skill challenge",
    otherChallengePlaceholder:
      "e.g. I want to learn to code but I don't know where it fits in my week.",
    questionLabel: "What would you ask a high-performing Engineering student?",
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
    "A free 90-minute academic and mentorship webinar for Engineering students. How to study effectively, which technical skills to build, and how to balance both — from students who are already doing it. Sunday, 13th September 2026, 6:00 pm WAT.",
  ogDescription:
    "Your degree is the foundation, not the whole career. Free 90-minute webinar for Engineering students — Sunday, 13th September 2026, 6:00 pm.",
};
