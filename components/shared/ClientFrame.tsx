"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function ClientFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const hideChrome = pathname?.startsWith("/tutorials/payment") || pathname?.startsWith("/admin") || pathname?.startsWith("/group-tutorials") || pathname?.startsWith("/preclinicals/success") || pathname?.startsWith("/bucc/success") || pathname?.startsWith("/bucc/advantage/success") || pathname?.startsWith("/tfa/success") || /^\/playbooks\/[^/]+\/success/.test(pathname ?? "");

  return (
    <>
      {/* First thing a keyboard user reaches: jump past the navbar. */}
      <a href="#main-content" className="skip-link">Skip to content</a>
      {!hideChrome && <Navbar />}
      {/* The admin layout has its own <main id="main-content">; wrapping it
          here too would nest two mains with the same id. */}
      {isAdmin ? children : <main id="main-content" tabIndex={-1} className="outline-none">{children}</main>}
      {!hideChrome && <Footer />}
    </>
  );
}
