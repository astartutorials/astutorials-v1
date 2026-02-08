import Link from "next/link";
import Image from "next/image";

export default function PaymentShell({
  children,
  sidebar,
  summary,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  summary: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900">
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="A-Star Tutorials"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <span className="text-sm font-semibold tracking-tight">
              A-Star Tutorials
            </span>
          </Link>
          <div className="text-sm text-gray-500">
            Need help?{" "}
            <Link href="#" className="text-[var(--astar-red)] hover:underline">
              Contact Support
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[260px_1fr_320px]">
        <aside className="rounded-2xl border border-gray-200 bg-white p-6">
          {sidebar}
        </aside>

        <main className="rounded-2xl border border-gray-200 bg-white p-8 md:p-10">
          {children}
        </main>

        <aside className="rounded-2xl border border-gray-200 bg-white p-6">
          {summary}
        </aside>
      </div>
    </div>
  );
}
