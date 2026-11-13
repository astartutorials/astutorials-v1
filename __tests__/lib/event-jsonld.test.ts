import { eventJsonLd, after } from '@/lib/event-jsonld';

const start = new Date('2026-11-08T09:00:00Z');

describe('eventJsonLd()', () => {
  it('describes an in-person free event at a Babcock venue', () => {
    const data = eventJsonLd({
      name: 'TFA', description: 'd', path: '/tfa', start, end: after(start, 300),
      images: ['/tfa/flyer.jpg'], online: false, venue: 'Auditorium', address: 'BUTH',
    });
    expect(data).toMatchObject({
      '@type': 'Event',
      url: 'https://astartutorials.com/tfa',
      startDate: '2026-11-08T09:00:00.000Z',
      endDate: '2026-11-08T14:00:00.000Z',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: 'Auditorium', address: { addressCountry: 'NG' } },
      image: ['https://astartutorials.com/tfa/flyer.jpg'],
      isAccessibleForFree: true,
      offers: { price: 0, priceCurrency: 'NGN' },
    });
  });

  it('describes an online event without exposing the join link', () => {
    const data = eventJsonLd({
      name: 'Law', description: 'd', path: '/playbooks/law', start, end: after(start, 90),
      images: ['https://cdn.example/x.png'], online: true, platform: 'Google Meet',
    });
    expect(data.eventAttendanceMode).toBe('https://schema.org/OnlineEventAttendanceMode');
    expect(data.location).toEqual({ '@type': 'VirtualLocation', url: 'https://astartutorials.com/playbooks/law', name: 'Google Meet' });
    expect(JSON.stringify(data)).not.toContain('meet.google.com');
    expect(data.image).toEqual(['https://cdn.example/x.png']);
    expect(data.endDate).toBe('2026-11-08T10:30:00.000Z');
  });
});
