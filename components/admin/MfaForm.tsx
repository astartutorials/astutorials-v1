'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { AlertCircle, Loader2, ShieldCheck, Smartphone } from "lucide-react";

type Mode =
  | { kind: "loading" }
  | { kind: "verify"; factorId: string }
  | { kind: "enroll"; factorId: string; qr: string; secret: string }
  | { kind: "failed"; message: string };

/**
 * The second sign-in step. The middleware sends a session here when it owes
 * a code (verify) or when its role requires an authenticator it hasn't set up
 * (enroll). Verifying upgrades the session cookie to aal2, then the dashboard
 * lets it in.
 */
export default function MfaForm() {
  const router = useRouter();
  const supabase = useMemo(
    () => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!),
    []
  );
  const [mode, setMode] = useState<Mode>({ kind: "loading" });
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
      if (cancelled) return;
      if (listError) {
        setMode({ kind: "failed", message: "We couldn't load your sign-in settings. Sign in again." });
        return;
      }

      const verified = factors.totp[0];
      if (verified) {
        setMode({ kind: "verify", factorId: verified.id });
        return;
      }

      // A set-up that was started and never finished blocks a new one; clear it.
      for (const f of factors.all.filter((f) => f.status === "unverified")) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "A-Star admin",
      });
      if (cancelled) return;
      if (enrollError || !data) {
        setMode({ kind: "failed", message: "We couldn't start setting up your authenticator. Try again in a moment." });
        return;
      }
      setMode({ kind: "enroll", factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    })();
    return () => { cancelled = true; };
  }, [supabase]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode.kind !== "verify" && mode.kind !== "enroll") return;
    setError("");
    setBusy(true);
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: mode.factorId,
      code: code.replace(/\s/g, ""),
    });
    if (verifyError) {
      setBusy(false);
      setCode("");
      setError("That code didn't work. Check the time on your phone is set automatically, then try the newest code.");
      return;
    }
    router.replace("/admin/dashboard");
    router.refresh();
  }

  async function signOut() {
    await fetch("/api/auth/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const enrolling = mode.kind === "enroll";

  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full lg:w-1/2 bg-[var(--astar-bg)] p-8 md:p-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-5">
            {enrolling ? <Smartphone className="text-[#D93025]" size={28} /> : <ShieldCheck className="text-[#D93025]" size={28} />}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {enrolling ? "Set up two-step sign-in" : "Enter your code"}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            {enrolling
              ? "Your account can see payments and students’ details, so it needs a code from your phone as well as your password."
              : "Open your authenticator app and enter the 6-digit code for A-Star."}
          </p>
        </div>

        {mode.kind === "loading" && (
          <div className="flex justify-center py-10 text-gray-400"><Loader2 className="animate-spin" size={22} /></div>
        )}

        {mode.kind === "failed" && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700 font-medium">{mode.message}</p>
          </div>
        )}

        {mode.kind === "enroll" && (
          <ol className="space-y-4 mb-6 text-sm text-gray-700">
            <li>
              <span className="font-semibold">1.</span> Install an authenticator app, such as Google Authenticator or Microsoft Authenticator.
            </li>
            <li>
              <span className="font-semibold">2.</span> In the app, add an account and scan this code:
              <div className="mt-3 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element -- an SVG data URL from Supabase */}
                <img src={mode.qr} alt="QR code for your authenticator app" width={180} height={180} className="rounded-lg border border-gray-200 bg-white p-2" />
              </div>
              <p className="mt-3 text-xs text-gray-500 text-center">
                Can&apos;t scan it? Enter this key instead:
                <code className="mt-1 block break-all rounded bg-gray-100 px-2 py-1 font-mono text-[11px] text-gray-700 select-all">{mode.secret}</code>
              </p>
            </li>
            <li><span className="font-semibold">3.</span> Enter the 6-digit code the app shows.</li>
          </ol>
        )}

        {(mode.kind === "verify" || mode.kind === "enroll") && (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <label htmlFor="mfa-code" className="sr-only">6-digit code</label>
            <input
              id="mfa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={7}
              placeholder="123 456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^\d\s]/g, ""))}
              className="w-full text-center tracking-[0.4em] text-2xl font-semibold py-3 rounded-lg border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none bg-white text-gray-800 placeholder:text-gray-300 placeholder:tracking-[0.4em]"
            />
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={busy || code.replace(/\s/g, "").length !== 6}
              className="w-full btn-primary bg-[var(--astar-red)] text-white font-bold py-3 rounded-lg shadow-lg shadow-red-500/20 text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking…</> : enrolling ? "Turn on and continue" : "Continue"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center space-y-2">
          {mode.kind === "verify" && (
            <p className="text-xs text-gray-400">Lost your phone? Contact an A-Star super admin to reset your two-step sign-in.</p>
          )}
          <button type="button" onClick={signOut} className="text-xs text-gray-400 hover:text-[#D93025] transition-colors">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
