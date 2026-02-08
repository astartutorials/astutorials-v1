export default function RequestDetailsForm() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">
        Tutorial Request Details
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Tell us about your tutoring needs so we can match you with the perfect
        tutor.
      </p>

      <form className="mt-8 space-y-6">
        <div>
          <label className="text-sm font-semibold text-gray-700">
            Full Name <span className="text-[var(--astar-red)]">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--astar-red)]"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Email <span className="text-[var(--astar-red)]">*</span>
            </label>
            <input
              type="email"
              placeholder="you@babcock.edu.ng"
              className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--astar-red)]"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Phone <span className="text-[var(--astar-red)]">*</span>
            </label>
            <input
              type="tel"
              placeholder="08012345678"
              className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--astar-red)]"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">
            Course of Study <span className="text-[var(--astar-red)]">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Computer Science"
            className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--astar-red)]"
          />
        </div>

        <div className="pt-2">
          <h2 className="text-sm font-semibold text-gray-700">
            Course You Need Help With
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Course Code <span className="text-[var(--astar-red)]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. COS 201"
                className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--astar-red)]"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Course Title <span className="text-[var(--astar-red)]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Data Structures"
                className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--astar-red)]"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Preferred Day <span className="text-[var(--astar-red)]">*</span>
            </label>
            <select className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--astar-red)]">
              <option>Select day</option>
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
              <option>Saturday</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Preferred Time <span className="text-[var(--astar-red)]">*</span>
            </label>
            <select className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--astar-red)]">
              <option>Select time</option>
              <option>8:00 AM</option>
              <option>10:00 AM</option>
              <option>12:00 PM</option>
              <option>2:00 PM</option>
              <option>4:00 PM</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">
            Preferred Location <span className="text-[var(--astar-red)]">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Library, Faculty building, etc."
            className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--astar-red)]"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">
            What do you need help with? (Optional)
          </label>
          <textarea
            rows={4}
            placeholder="Describe specific topics, chapters, or areas you're struggling with..."
            className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--astar-red)]"
          />
        </div>

        <p className="text-xs text-gray-400">
          By submitting you agree to our Terms & Privacy. A manager will contact
          you within 24 hours.
        </p>

        <button className="w-full rounded-lg bg-[var(--astar-red)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700">
          Submit Request
        </button>
      </form>
    </div>
  );
}
