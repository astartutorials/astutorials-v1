import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section, ContactLines } from "@/components/legal/LegalPage";
import { SUPPORT_EMAIL, WHATSAPP_NUMBER_LABEL } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What personal information A-Star Tutorials collects from students and parents, why, who it is shared with, and your rights over it.",
  alternates: { canonical: "/privacy" },
};

/*
 * Drafted from what the site actually collects (the forms and their tables)
 * and the services it actually uses. Not legal advice: have it checked, and
 * keep it in step when a form or a provider changes.
 */
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      current="/privacy"
      intro={
        <>
          This explains what personal information A-Star Tutorials (“A-Star”, “we”) collects when you use
          astartutorials.com, why we collect it, and what you can do about it. We follow the Nigeria Data
          Protection Act 2023.
        </>
      }
    >
      <Section title="What we collect">
        <p><strong>Information you give us</strong>, depending on what you do on the site:</p>
        <ul>
          <li><strong>Booking a tutorial or a Semester Plan:</strong> your name, email, phone number, course, and what you booked.</li>
          <li><strong>Registering as a student or for an event:</strong> your name, email, phone or WhatsApp number, course of study and level. Some forms also ask for your social media handles, your birthday (day and month only), how you heard about us, and any question you want answered.</li>
          <li><strong>Parent or guardian details:</strong> some forms ask for a parent or guardian’s name, phone number and email, and a parent can also fill in a form themselves.</li>
          <li><strong>Applying to be a tutor or an ambassador:</strong> the details in your application, such as your institution, course, level and matriculation number. Approved ambassadors also give us bank account details so we can pay their commission.</li>
          <li><strong>Feedback and messages:</strong> ratings and comments you leave after a tutorial, and anything you send us by email or WhatsApp.</li>
        </ul>
        <p>
          <strong>Payments.</strong> Payments are handled by Paystack. We never see or store your card or bank
          login details. We keep a record of the amount, the date, the payment reference and whether it succeeded.
        </p>
        <p>
          <strong>Information collected automatically.</strong> We use analytics to see how the site is used:
          the pages you visit, what you click, your device and browser, your approximate location (country and
          city, from your IP address), and recordings of how pages are used so we can find and fix problems.
          This uses cookies and similar storage in your browser.
        </p>
      </Section>

      <Section title="Why we use it">
        <ul>
          <li>To provide what you asked for: book your seat, enrol you, match you with a tutor, and send receipts, reminders and confirmations.</li>
          <li>To contact you or your parent or guardian about your tutorials, payments and schedule.</li>
          <li>To review tutor and ambassador applications, and to pay ambassadors.</li>
          <li>To tell you about A-Star tutorials and events we think are relevant to you. You can ask us to stop at any time.</li>
          <li>To keep the site secure, prevent fraud and abuse, and improve how it works.</li>
          <li>To keep the records we are required to keep, such as payment records.</li>
        </ul>
        <p>
          We rely on your consent (for example when you register or apply), on what is needed to deliver a
          service you have paid for, on our legitimate interest in running and improving A-Star, and on our
          legal obligations.
        </p>
      </Section>

      <Section title="If you give us someone else’s details">
        <p>
          If you give us a parent or guardian’s contact details, please let them know. We use those details
          only to contact them about your tutorials, payments and progress, and about A-Star programmes for you.
        </p>
      </Section>

      <Section title="Who we share it with">
        <p>We do not sell your information. We share it only with:</p>
        <ul>
          <li><strong>Your tutor</strong>, who sees what they need to teach you: your name, course and contact details for arranging sessions.</li>
          <li><strong>Services that run the site for us:</strong> Paystack (payments), Supabase (our database), Resend (email), PostHog and Vercel (analytics and hosting), and Cloudflare (blocking bots on our forms).</li>
          <li><strong>WhatsApp</strong>, when you choose to message us there.</li>
          <li><strong>Authorities</strong>, where the law requires it.</li>
        </ul>
        <p>
          Some of these services store information outside Nigeria. Where they do, we rely on the safeguards
          the law allows for such transfers.
        </p>
      </Section>

      <Section title="How long we keep it">
        <p>
          We keep your information for as long as we need it for the reasons above, and for as long as the law
          requires us to keep payment records. When we no longer need it, we delete it or remove what identifies you.
        </p>
      </Section>

      <Section title="How we protect it">
        <p>
          The site runs over an encrypted connection. Our database is not open to the public, and only A-Star
          staff who need the information can see it, each with access limited to their role. No system is
          perfectly secure, but if a breach puts your information at risk we will tell you and the regulator as
          the law requires.
        </p>
      </Section>

      <Section title="Your rights">
        <p>You can ask us to:</p>
        <ul>
          <li>show you the information we hold about you;</li>
          <li>correct anything that is wrong;</li>
          <li>delete your information, where we have no legal reason to keep it;</li>
          <li>stop using it for marketing, or stop a use you object to;</li>
          <li>withdraw a consent you gave.</li>
        </ul>
        <p>
          To do any of these, contact us using the details below. If you are unhappy with how we respond, you
          can complain to the Nigeria Data Protection Commission.
        </p>
      </Section>

      <Section title="Students under 18">
        <p>
          Some university students are under 18. If you are, please register and pay with a parent or
          guardian’s knowledge and agreement. A parent or guardian can ask us to show, correct or delete their
          child’s information.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If we change this policy we will update this page and the date at the top. If a change is
          significant, we will tell you by email or on the site.
        </p>
      </Section>

      <Section title="Contact us">
        <ContactLines email={SUPPORT_EMAIL} whatsapp={WHATSAPP_NUMBER_LABEL} />
        <p>
          See also our <Link href="/terms">Terms of Service</Link> and <Link href="/refund-policy">Refund Policy</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
