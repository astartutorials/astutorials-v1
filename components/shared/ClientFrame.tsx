"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import CookieNotice from "@/components/shared/CookieNotice";

export default function ClientFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideChrome = pathname?.startsWith("/tutorials/payment") || pathname?.startsWith("/admin") || pathname?.startsWith("/group-tutorials") || pathname?.startsWith("/preclinicals/success") || pathname?.startsWith("/bucc/success") || pathname?.startsWith("/bucc/advantage/success") || pathname?.startsWith("/tfa/success") || /^\/playbooks\/[^/]+\/success/.test(pathname ?? "");

  return (
    <>
      {!hideChrome && <Navbar />}
      <main>{children}</main>
      {!hideChrome && <Footer />}
      {/* The public site only: the admin is for signed-in staff, not visitors. */}
      {!pathname?.startsWith("/admin") && <CookieNotice />}
    </>
  );
}
