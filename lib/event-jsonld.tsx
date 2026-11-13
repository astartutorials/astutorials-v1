/**
 * schema.org Event data for A-Star's free events, so Google can show the date,
 * time and place in search results. Google only does that for upcoming events;
 * past ones simply describe what happened, which is harmless. Each event page
 * renders it from the same constants its copy uses, so a new date in lib/tfa.ts
 * or a new Playbook file updates the search data with no further change.
 */

const SITE = "https://astartutorials.com";

interface BaseEvent {
  name: string;
  description: string;
  /** Path on the site, e.g. "/tfa". */
  path: string;
  start: Date;
  end: Date;
  /** Paths or absolute URLs. */
  images: string[];
}

export type EventInput =
  | (BaseEvent & { online: false; venue: string; address: string })
  | (BaseEvent & { online: true; platform: string });

const absolute = (u: string) => (u.startsWith("http") ? u : `${SITE}${u}`);

export function eventJsonLd(e: EventInput) {
  const url = `${SITE}${e.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.name,
    description: e.description,
    url,
    startDate: e.start.toISOString(),
    endDate: e.end.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: e.online
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    // The join link goes to registrants only, so the page itself is the location.
    location: e.online
      ? { "@type": "VirtualLocation", url, name: e.platform }
      : {
          "@type": "Place",
          name: e.venue,
          address: {
            "@type": "PostalAddress",
            streetAddress: e.address,
            addressLocality: "Ilishan-Remo",
            addressRegion: "Ogun State",
            addressCountry: "NG",
          },
        },
    image: e.images.map(absolute),
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "NGN",
      availability: "https://schema.org/InStock",
      url,
    },
    organizer: { "@type": "EducationalOrganization", name: "A-Star Tutorials", url: SITE },
  };
}

/** Minutes after `start`. */
export const after = (start: Date, minutes: number) => new Date(start.getTime() + minutes * 60_000);

export function EventJsonLd({ event }: { event: EventInput }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd(event)) }}
    />
  );
}
