import type { Metadata } from "next";
import AdminLoginLeft from "@/components/admin/AdminLoginLeft";
import MfaForm from "@/components/admin/MfaForm";

export const metadata: Metadata = {
  title: "Two-step sign-in",
  robots: { index: false },
};

export default function AdminMfaPage() {
  return (
    <div className="min-h-screen w-full flex">
      <AdminLoginLeft />
      <MfaForm />
    </div>
  );
}
