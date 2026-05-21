<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the A-Star Tutorials Next.js App Router project. The project already had `posthog-js` and `posthog-node` installed, `instrumentation-client.ts` initialised (the recommended approach for Next.js 15.3+), a reverse proxy configured in `next.config.ts`, a server-side client at `lib/posthog-server.ts`, and several events already firing. This pass added user identification at key conversion points, new business-critical client and server events, and fixed pre-existing lint errors.

**Summary of changes:**
- **User identification** – `posthog.identify()` now fires with email, name, and phone when users initiate group or private bookings, and server-side when tutor applications are received, linking anonymous session activity to known people.
- **Admin login tracking** – the admin login API now captures `admin_logged_in` (with server-side `identify`) and `admin_login_failed` (with failure reason).
- **Server-side tutor application event** – `tutor_application_received` fires after confirmed Notion + Supabase save, providing a reliable server-authoritative signal.
- **Tutorial type toggle** – `tutorial_type_switched` fires when users switch between group and private views.
- **Job listing viewed** – `job_listing_viewed` fires when a user opens a job posting modal.

| Event | Description | File |
|---|---|---|
| `tutorial_type_switched` | User switches between Group and Private tutorial view | `components/tutorials/TutorialToggle.tsx` |
| `job_listing_viewed` | User opens a job posting modal | `components/careers/JobCard.tsx` |
| `admin_logged_in` | Admin successfully authenticated (server-side) | `app/api/auth/admin/login/route.ts` |
| `admin_login_failed` | Admin login attempt failed — bad credentials or role (server-side) | `app/api/auth/admin/login/route.ts` |
| `tutor_application_received` | Server confirmed tutor application saved to Notion + Supabase | `app/api/tutor-applications/route.ts` |
| `posthog.identify()` | Identifies user by email on group booking initiation | `components/group-tutorials/GroupBookingModal.tsx` |
| `posthog.identify()` | Identifies user by email on private booking initiation | `components/tutorials/EmailModal.tsx` |

**Previously instrumented events (unchanged):**

| Event | File |
|---|---|
| `group_booking_modal_opened` | `app/tutorials/page.tsx` |
| `group_booking_initiated` | `components/group-tutorials/GroupBookingModal.tsx` |
| `private_booking_initiated` | `components/tutorials/EmailModal.tsx` |
| `job_application_link_clicked` | `components/careers/JobApplicationModal.tsx` |
| `tutor_application_submitted` | `components/apply/TutorApplicationForm.tsx` |
| `feedback_submitted` | `components/feedback/FeedbackForm.tsx` |
| `payment_verified` | `app/api/paystack/verify/route.ts` |
| `payment_verification_failed` | `app/api/paystack/verify/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1613993)
- [Group Booking Conversion Funnel](/insights/ETDS534S) — 3-step funnel: modal opened → booking initiated → payment verified
- [Total Bookings Over Time](/insights/72Uots5z) — daily line chart of group vs private bookings
- [Payment Success vs Failure](/insights/GXpSEOJz) — monitors payment reliability
- [Tutor Applications Submitted](/insights/d8p0aB1T) — weekly recruitment pipeline volume
- [Feedback Submissions Over Time](/insights/fsX7PSfg) — weekly student session feedback rate

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
