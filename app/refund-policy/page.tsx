import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section, ContactLines } from "@/components/legal/LegalPage";
import { SUPPORT_EMAIL, WHATSAPP_NUMBER_LABEL } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Payments to A-Star Tutorials for tutorials and Semester Plans are non-refundable, except duplicate payments. How to report a duplicate payment.",
  alternates: { canonical: "/refund-policy" },
};

/*
 * States the rule agreed on 2026-11-12 and already in the FAQ (lib/faq.ts):
 * non-refundable, except duplicate payments. Nothing else is promised here.
 */
export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      current="/refund-policy"
      intro="Please read this before you pay. It applies to every payment made on astartutorials.com."
    >
      <Section title="Payments are non-refundable">
        <p>
          Payments for individual tutorial bookings (group and private) and for the Full Semester Plan are
          non-refundable. This includes each payment on a Semester Plan paid in 2 instalments.
        </p>
        <p>
          We hold your seat, schedule tutors and plan the semester around the students who have paid, which is
          why we cannot refund a booking you no longer want or a session you miss.
        </p>
      </Section>

      <Section title="The exception: duplicate payments">
        <p>
          If you were charged more than once for the same thing, we will refund the extra payment in full.
        </p>
      </Section>

      <Section title="How to report a duplicate payment">
        <ul>
          <li>Message us on WhatsApp or email us, using the details below.</li>
          <li>Include the name and email used to pay, and the payment references from your receipts or your bank alerts.</li>
          <li>Once we confirm the duplicate, we refund it to the card or account it was paid from. How long it takes to reach you depends on your bank.</li>
        </ul>
      </Section>

      <Section title="Paid, but no confirmation?">
        <p>
          If money left your account and you did not get a confirmation email, do not pay again. Contact us
          with your payment reference and we will confirm your booking.
        </p>
      </Section>

      <Section title="Contact us">
        <ContactLines email={SUPPORT_EMAIL} whatsapp={WHATSAPP_NUMBER_LABEL} />
        <p>
          See also our <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
