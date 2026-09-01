import type { Playbook } from "./types";

/**
 * THE LAW PLAYBOOK — "What They Don't Teach You About Succeeding in Law."
 *
 * ⚠️ Before announcing: set `dateLabel`/`closesAt` to the real date (they must
 * describe the same instant — closesAt is 19:00 WAT = 18:00 UTC) and paste the
 * Google Meet link into NEXT_PUBLIC_LAW_MEETING_URL. While the link is empty
 * the page and the email both say we'll send it nearer the time.
 */
export const law: Playbook = {
  slug: "law",
  name: "The Law Playbook",
  shortName: "Law",
  tagline: "What They Don't Teach You About Succeeding in Law",
  promise: "Study effectively. Build yourself. Balance both.",
  forWho: "For undergraduate Law students at every level",
  navBlurb: "Free 90-minute webinar for Law students",

  accent: "law",
  motif: "columns",

  dateLabel: "Sunday, 4th October 2026",
  timeLabel: "7:00 pm WAT",
  durationLabel: "90 minutes",
  platform: "Google Meet",
  meetingUrl: process.env.NEXT_PUBLIC_LAW_MEETING_URL ?? "",
  closesAt: new Date("2026-10-04T18:00:00Z"),

  bigLine:
    "Law school is preparing you for a profession, not just for an examination.",

  questions: [
    {
      q: "How do I study Law effectively?",
      a: "Not “read more”. The actual method: how to read a textbook, how to handle cases and authorities, what a usable note looks like, and how revision is structured.",
    },
    {
      q: "What do I build outside the classroom?",
      a: "Writing, research, advocacy, technology, competitions, internships, a name people recognise. What earns its place while you're still a student.",
    },
    {
      q: "How do I carry both?",
      a: "Where the time comes from, what to say no to, and how to avoid the trap of being permanently busy without ever making progress.",
    },
  ],

  bigIdeaParas: [
    "Every Law student is told the same three things: read early, read widely, don't fall behind.",
    "None of that tells you what to do on a Tuesday evening with four courses, a reading list you haven't started and a case you've read three times without understanding.",
    "The students who do well are not reading more hours than you. They are reading differently, and they decided how to spend their week before the week started.",
    "This is 90 minutes of that method, from students who are getting the results — plus the honest account of what they built outside the classroom, and what it cost them.",
  ],
  closingLine: "The speakers bring the experience. A-Star brings the structure.",

  segments: [
    { time: "0–5", title: "Speakers' Introduction", purpose: "Who they are, what they've achieved, why you should listen" },
    { time: "5–65", title: "The Law Student's Playbook", purpose: "Three 20-minute deep dives, every speaker on every topic" },
    { time: "65–75", title: "Q&A", purpose: "Curated student questions, directed to the right speaker" },
    { time: "75–90", title: "The A-Star Advantage", purpose: "The structure that turns the advice into a habit" },
  ],

  topics: [
    {
      time: "5–25",
      title: "How to study Law effectively",
      prompt: "Let's start with the foundation: how do you actually study Law effectively?",
      covers: [
        "How they approach lectures",
        "Reading Law textbooks",
        "Cases & authorities",
        "Note-taking",
        "Revision",
        "Past questions",
        "Time management",
        "Examination preparation",
        "The study methods they abandoned",
      ],
      takeaway: "Not “study hard”. This is exactly how I study.",
    },
    {
      time: "25–45",
      title: "Developing yourself beyond the classroom",
      prompt:
        "Law school is preparing you for a profession, not just an examination. So what should a Law student be building outside the classroom?",
      covers: [
        "Relevant skills",
        "Technology",
        "Research",
        "Writing",
        "Public speaking",
        "Networking",
        "Leadership",
        "Competitions & moots",
        "Internships",
        "Personal branding",
        "Career exploration",
      ],
      takeaway: "What can I start building now that will give me an advantage later?",
    },
    {
      time: "45–65",
      title: "Balancing academics & personal development",
      prompt:
        "You've told us what students should do academically and what they should be building outside the classroom. But how do you actually balance both?",
      covers: [
        "Managing time",
        "Setting priorities",
        "A realistic schedule",
        "Avoiding burnout",
        "Knowing when to say no",
        "Choosing opportunities",
        "Staying consistent",
        "Busy vs. actually progressing",
      ],
      takeaway:
        "You don't have to choose between academic excellence and personal development. You need a system where both can coexist.",
    },
  ],

  feature: {
    eyebrow: "Beyond the Classroom",
    title: "What a Law student can be building right now",
    blurb:
      "Segment two is the one students most often skip and most often regret skipping. These are the areas the speakers will be pushed to be concrete about.",
    layout: "grid",
    items: [
      { label: "Writing", note: "The profession runs on it. A student who writes clearly is visible long before they qualify." },
      { label: "Research", note: "Finding the authority, and knowing when you've actually found it. Faster than everyone else." },
      { label: "Advocacy", note: "Mooting, debating, speaking on your feet — the skill you cannot cram the week before." },
      { label: "Technology", note: "Legal research tools, drafting, automation. The part of the profession that is changing fastest." },
      { label: "Competitions", note: "Moots and essay competitions: a deadline, a standard, and something real on your CV." },
      { label: "A network", note: "Not collecting contacts. Being known by a few people who can vouch for your work." },
    ],
  },

  qaQuestions: [
    "How many hours should I study daily?",
    "How do I actually remember cases?",
    "How do I balance multiple Law courses at once?",
    "How do I start building relevant skills from where I am?",
    "How do I know which opportunities are worth pursuing?",
    "How do I avoid burnout?",
    "How early should I start preparing for exams?",
    "What would you do differently if you were starting again?",
  ],

  moderatorRule: {
    vague: "You just need to manage your time.",
    followUp: "What did that actually look like for you? Walk us through a typical week.",
  },

  speakerStrategy: [
    { label: "The academic", desc: "Strong results, and able to explain the method behind them rather than just the outcome." },
    { label: "The developer", desc: "Strong outside the classroom — competitions, skills, internships, a profile." },
    { label: "The balancer", desc: "Carries both at once, and can say honestly what that costs and how it's scheduled." },
  ],

  advantage: {
    name: "A-Star Law Tutorials",
    intro:
      "Tonight you've heard what successful students do. Knowing what to do and consistently doing it are two very different things.",
    items: [
      "Structured classes on the courses that matter",
      "Tutors who sat the same papers",
      "Curated learning resources",
      "Past questions",
      "Quizzes",
      "Revision sessions",
      "Mock examinations",
      "Accountability",
      "Examination preparation",
    ],
    positioning:
      "A-Star isn't simply giving students more classes. We're giving them a structured system for understanding, practising and preparing.",
  },

  audience: [
    "Law students who are working hard and still not seeing the results",
    "Students who can read a case but can't turn it into an answer",
    "Anyone who keeps meaning to start mooting, writing or interning “next semester”",
    "Students who are busy every day and can't point to what improved",
    "Anyone who wants the profession, not just the degree",
  ],

  form: {
    levels: ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "Law School / Graduate"],
    disciplineLabel: "",
    disciplines: [],
    academicChallengeLabel: "Your biggest academic challenge right now",
    academicChallengePlaceholder:
      "Be specific — “I can't condense a case into something I can revise from” is more useful than “reading”.",
    otherChallengeLabel: "Your biggest challenge outside academics",
    otherChallengePlaceholder:
      "e.g. I want to moot but I've never spoken in front of a room.",
    questionLabel: "What would you ask a high-performing Law student?",
    questionPlaceholder: "The strongest questions get answered live during the Q&A.",
    heardOptions: [
      "A coursemate",
      "Class or faculty group",
      "Instagram",
      "X (Twitter)",
      "TikTok",
      "WhatsApp",
      "An A-Star tutor",
      "Other",
    ],
  },

  metaDescription:
    "A free 90-minute academic and mentorship webinar for Law students. How to study Law effectively, what to build outside the classroom, and how to balance both — from students who are already doing it. Sunday, 4th October 2026, 7:00 pm WAT.",
  ogDescription:
    "Law school is preparing you for a profession, not just an examination. Free 90-minute webinar for Law students — Sunday, 4th October 2026, 7:00 pm.",
};
