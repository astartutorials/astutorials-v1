import { Fragment, type CSSProperties } from "react";

/**
 * Splits a heading into one span per word, numbered with --i, for the CSS
 * word reveals: put it inside an element with `reveal-words` (on scroll) or
 * `hero-words` (on load). Plain text in the HTML, so screen readers and
 * search engines read the sentence normally. `start` continues the count
 * when a heading is split across several <Words>.
 */
export default function Words({ text, start = 0 }: { text: string; start?: number }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span style={{ "--i": start + i } as CSSProperties}>{word}</span>
        </Fragment>
      ))}
    </>
  );
}
