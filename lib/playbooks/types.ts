/**
 * The Playbook series — A-Star's 90-minute discipline webinars.
 *
 * The BUCC Advantage was built as one bespoke page (lib/bucc.ts +
 * components/bucc/*). Three more webinars in the same mould would have meant
 * three more copies of a 680-line landing component, three tables, three API
 * routes and three admin pages — and every future fix applied four times.
 *
 * So a Playbook is *data*. Everything that differs between Engineering, Law and
 * Health Sciences lives in one config file per playbook; the landing page, the
 * registration modal, the confirmation email, the success page and the admin
 * console are written once and read the config. Running a fourth Playbook is a
 * new file in this directory plus one line in the registry.
 *
 * What is deliberately NOT shared: each playbook picks its own accent and hero
 * motif (see `accent` and `motif` below), so the three read as siblings rather
 * than as the same page with the nouns swapped.
 */

/** Directory-safe id. Doubles as the URL segment and the DB discriminator. */
export type PlaybookSlug = "engineering" | "law" | "health-sciences";

/**
 * Which accent palette the page wears. Each value has a matching
 * `[data-playbook="…"]` block in app/globals.css that sets --pb-fill,
 * --pb-ink, --pb-soft-bg, --pb-soft-border and --pb-on-dark, with a `.dark`
 * override for the ink. Components only ever reference the variables, so a
 * retune is a CSS edit and never a component edit.
 */
export type PlaybookAccent = PlaybookSlug;

/** The decorative treatment behind the hero. */
export type PlaybookMotif = "blueprint" | "columns" | "pulse";

/** One row of the 90-minute schedule table. */
export interface PlaybookSegment {
  /** e.g. "0–5". Minutes, without the unit. */
  time: string;
  title: string;
  purpose: string;
}

/** One of the three 20-minute deep dives that make up the Playbook itself. */
export interface PlaybookTopic {
  /** e.g. "5–25". */
  time: string;
  title: string;
  /** The moderator's opening question, quoted verbatim on the page. */
  prompt: string;
  /** What the speakers actually work through. Rendered as chips. */
  covers: string[];
  /** The single sentence a student should leave the segment holding. */
  takeaway: string;
}

/** One of the three questions the whole event exists to answer. */
export interface PlaybookQuestion {
  q: string;
  a: string;
}

/**
 * The one section that is genuinely different per playbook.
 *
 * `grid` renders label/note cards — Engineering's skills stack, Law's
 * beyond-the-classroom list. `shift` renders before → after rows, which is how
 * Health Sciences shows what actually changes between 100 and 200 level.
 */
export interface PlaybookFeature {
  eyebrow: string;
  title: string;
  blurb: string;
  layout: "grid" | "shift";
  /** For `shift`, `label` is the 100-level habit and `note` is what replaces it. */
  items: { label: string; note: string }[];
}

/** Fields on the registration form that vary by discipline. */
export interface PlaybookForm {
  levels: string[];
  /** e.g. "Engineering Discipline", "Department". */
  disciplineLabel: string;
  disciplines: string[];
  /** The "biggest academic challenge" prompt, in this discipline's language. */
  academicChallengeLabel: string;
  academicChallengePlaceholder: string;
  /** The second, non-academic challenge prompt. */
  otherChallengeLabel: string;
  otherChallengePlaceholder: string;
  /** "What would you ask a high-performing X student?" */
  questionLabel: string;
  questionPlaceholder: string;
  heardOptions: string[];
}

/** The 75–90 minute segment: what A-Star is actually selling. */
export interface PlaybookAdvantage {
  /** e.g. "A-Star Engineering Tutorials". */
  name: string;
  intro: string;
  items: string[];
  positioning: string;
  /** When the tutorials themselves begin, e.g. "17th September 2026". */
  startsOn: string;
}

/**
 * A confirmed panellist.
 *
 * `discipline` and `role` are both optional: some panels are announced with a
 * department and an office, others with a name and nothing else, and inventing
 * a title for somebody is worse than leaving it off. A speaker with neither is
 * labelled simply "Speaker".
 */
export interface PlaybookSpeaker {
  name: string;
  /** Course or department, e.g. "Medical Laboratory Science". */
  discipline?: string;
  /** Office or credential, e.g. "President, MEDLAB". */
  role?: string;
}

export interface Playbook {
  slug: PlaybookSlug;
  /** Full title, e.g. "The Engineering Playbook". */
  name: string;
  /** Used where the full title is too long — nav, admin tabs, email subjects. */
  shortName: string;
  /** "What They Don't Teach You About Succeeding in Engineering". */
  tagline: string;
  /** The three-beat promise under the tagline, e.g. "Study effectively. …". */
  promise: string;
  /** One sentence naming the audience, shown in the hero and the OG card. */
  forWho: string;
  /** Nav-menu blurb while registration is open. */
  navBlurb: string;

  accent: PlaybookAccent;
  motif: PlaybookMotif;

  dateLabel: string;
  timeLabel: string;
  durationLabel: string;
  platform: string;
  /**
   * The join link, sent in the confirmation email and shown on the success
   * page. Empty until the room is booked — callers fall back to "we'll send it
   * before the event" rather than shipping a dead link.
   */
  meetingUrl: string;
  /** Registration closes when the webinar starts. */
  closesAt: Date;

  /** The pull-quote that sits under the hero. */
  bigLine: string;
  questions: [PlaybookQuestion, PlaybookQuestion, PlaybookQuestion];
  bigIdeaParas: string[];
  closingLine: string;
  segments: PlaybookSegment[];
  topics: [PlaybookTopic, PlaybookTopic, PlaybookTopic];
  feature: PlaybookFeature;
  qaQuestions: string[];
  /**
   * The moderator's job in one exchange: a vague answer and the follow-up that
   * turns it into something a student can actually use.
   */
  moderatorRule: { vague: string; followUp: string };
  /**
   * The confirmed panel. Empty until speakers are locked in, which is why
   * `speakerStrategy` exists — the landing page falls back to describing the
   * panel by the perspectives it is built from rather than shipping an empty
   * section or a grid of "TBA" tiles.
   */
  speakers: PlaybookSpeaker[];
  /** Shows a "more to be announced" tile beside the confirmed names. */
  moreSpeakersToCome: boolean;
  /**
   * How the panel is picked: the perspective each seat brings rather than who
   * fills it. Stands in for the names before they are confirmed, and survives
   * afterwards as the line explaining why no two speakers repeat each other.
   */
  speakerStrategy: { label: string; desc: string }[];
  advantage: PlaybookAdvantage;
  audience: string[];
  /** The discipline-specific parts of the registration form. */
  form: PlaybookForm;

  /** SEO. Kept in the config so the route file stays generic. */
  metaDescription: string;
  ogDescription: string;
}

/**
 * Whether registration is still open. Callers on statically rendered pages
 * should evaluate this on the client (see usePlaybookOpen) — a build-time
 * answer would be frozen into the HTML until the next deploy.
 */
export function isPlaybookOpen(playbook: Playbook, now: Date = new Date()): boolean {
  return now <= playbook.closesAt;
}

/** The public URL of a playbook's landing page. */
export function playbookHref(slug: PlaybookSlug): string {
  return `/playbooks/${slug}`;
}
