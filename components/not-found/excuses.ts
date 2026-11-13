/**
 * The 404 page's excuses: one is picked at random per visit, and "Try another
 * excuse" steps through the rest. `mark` is the phrase in `title` that gets
 * the red underline; it must appear in `title` exactly.
 *
 * Student-life humour, Babcock-flavoured. Keep it kind: no jokes at parents',
 * lecturers' or the school's expense, and nothing that claims a fact about
 * A-Star's timetable.
 */
export interface Excuse {
  id: string;
  tag: string;
  title: string;
  mark: string;
  body: string;
}

export const EXCUSES: Excuse[] = [
  {
    id: "absent",
    tag: "Marked absent",
    title: "This page didn't make it to class.",
    mark: "class",
    body: "We called its name twice. No answer. It may have moved, changed its name, or never existed.",
  },
  {
    id: "carryover",
    tag: "Carryover",
    title: "This page is on carryover.",
    mark: "carryover",
    body: "It didn't pass last semester and hasn't been seen since. Let's get you to something that's actually sitting the exam.",
  },
  {
    id: "7am",
    tag: "7am class",
    title: "This page skipped the 7am class.",
    mark: "7am",
    body: "Honestly? Understandable. But you're up now, so let's not waste it.",
  },
  {
    id: "syllabus",
    tag: "Not in the syllabus",
    title: "This wasn't in the course outline.",
    mark: "course outline",
    body: "You read everything, and there's still a question you've never seen. Classic. Here's what's actually on the outline.",
  },
  {
    id: "group-project",
    tag: "Group project",
    title: "This page left the group chat.",
    mark: "group chat",
    body: "Like that one group project member: it was here, and then it wasn't. Don't worry, we'll carry the work.",
  },
  {
    id: "wrong-hall",
    tag: "Wrong venue",
    title: "You're in the wrong lecture hall.",
    mark: "wrong",
    body: "Everyone's done it. Quietly pick up your bag and try one of these instead.",
  },
  {
    id: "cgpa",
    tag: "Grade check",
    title: "404 isn't the number we're aiming for.",
    mark: "number",
    body: "We prefer ours a lot closer to 5.0. Let's get you back on track.",
  },
  {
    id: "reading",
    tag: "Night before the exam",
    title: "This page is still “reading ahead”.",
    mark: "“reading ahead”",
    body: "It said it would start early this semester. We believed it too. Here's where the real studying happens.",
  },
];
