import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section, ContactLines } from "@/components/legal/LegalPage";
import { SUPPORT_EMAIL, WHATSAPP_NUMBER_LABEL } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms for using astartutorials.com and for booking tutorials and Semester Plans with A-Star Tutorials.",
  alternates: { canonical: "/terms" },
};

/*
 * Drafted from how the site already works (booking, Paystack, Semester Plan
 * instalments, codes) and the refund rule in lib/faq.ts. Not legal advice:
 * have it checked before relying on it.
 */
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      current="/terms"
      intro={
        <>
          These terms apply when you use astartutorials.com or book anything with A-Star Tutorials (“A-Star”,
          “we”). By using the site or paying for a tutorial, you agree to them.
        </>
      }
    >
      <Section title="What we offer">
        <p>
          A-Star provides academic tutorials for university students: group tutorials, private one-on-one
          tutorials, the Full Semester Plan, and events and programmes we announce on the site. Tutorials are
          taught by tutors we have vetted. They support your studies; they do not replace your university’s
          lectures, and we are not responsible for your university’s teaching, exams or results.
        </p>
      </Section>

      <Section title="Booking and paying">
        <ul>
          <li>Prices are shown on the site in naira at the time you book. We may change prices, but not for a booking you have already paid for.</li>
          <li>Payments are made online through Paystack. Your booking is confirmed when your payment succeeds and you receive a confirmation email.</li>
          <li>Group tutorials have limited seats. A seat is yours only once you have paid.</li>
          <li>For private tutorials, you pay first and we then match you with a tutor and agree a time with you on WhatsApp.</li>
          <li>Give us correct details when you book. We use them to confirm your booking and reach you.</li>
        </ul>
      </Section>

      <Section title="The Full Semester Plan">
        <ul>
          <li>The plan covers the sessions and semester described on the Semester Plan page when you pay.</li>
          <li>After paying, message us on WhatsApp so we can enrol you and set your schedule.</li>
          <li>If you choose to pay in 2 instalments, the total is higher than paying in full, as shown at checkout. The second payment is due on the date shown when you make the first, and you agree to pay it by then.</li>
          <li>A plan is for the student it was bought for and cannot be shared or transferred to someone else.</li>
        </ul>
      </Section>

      <Section title="Discount and referral codes">
        <ul>
          <li>One code per order. Codes cannot be combined, exchanged for cash or applied after you have paid.</li>
          <li>Some codes are limited in number or time, and some payment options do not accept discounts. Checkout shows what applies.</li>
          <li>We may cancel a code that is being misused.</li>
        </ul>
      </Section>

      <Section title="Refunds">
        <p>
          Payments are non-refundable, except duplicate payments. The full rule is in our{" "}
          <Link href="/refund-policy">Refund Policy</Link>.
        </p>
      </Section>

      <Section title="In the tutorial">
        <ul>
          <li>Be on time and treat tutors and other students with respect. We may remove someone who disrupts a tutorial, without a refund.</li>
          <li>Notes, slides, question banks and recordings we provide are for your own study. Please do not share, sell or post them.</li>
          <li>Do not record a tutorial without the tutor’s permission.</li>
          <li>Use your own booking. Do not attend in someone else’s place or let someone attend in yours.</li>
        </ul>
      </Section>

      <Section title="Results">
        <p>
          We work hard to help you do well, but your results depend on many things, including your own effort.
          We do not guarantee any grade or result.
        </p>
      </Section>

      <Section title="Tutors and ambassadors">
        <p>
          Applying to tutor or to be an ambassador does not guarantee you a place. If you are accepted, the
          terms we agree with you then apply alongside these.
        </p>
      </Section>

      <Section title="Using the site">
        <ul>
          <li>Do not misuse the site: no attempts to break in, overload it, scrape it, or submit false registrations.</li>
          <li>The A-Star name, logo and site content belong to A-Star. Do not use them without our permission.</li>
          <li>We try to keep the site available and accurate, but we do not promise it will always be so.</li>
        </ul>
      </Section>

      <Section title="Our responsibility to you">
        <p>
          To the extent the law allows, our responsibility for any claim about a booking is limited to the
          amount you paid for it, and we are not responsible for indirect losses. Nothing here removes rights
          you have under Nigerian consumer protection law.
        </p>
      </Section>

      <Section title="Your information">
        <p>
          Our <Link href="/privacy">Privacy Policy</Link> explains what we collect and how we use it.
        </p>
      </Section>

      <Section title="Changes and governing law">
        <p>
          We may update these terms. The version on this page when you book is the one that applies to that
          booking. These terms are governed by the laws of the Federal Republic of Nigeria.
        </p>
      </Section>

      <Section title="Contact us">
        <ContactLines email={SUPPORT_EMAIL} whatsapp={WHATSAPP_NUMBER_LABEL} />
      </Section>
    </LegalPage>
  );
}
