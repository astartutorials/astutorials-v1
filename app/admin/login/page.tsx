import AdminLoginLeft from "@/components/admin/AdminLoginLeft";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen w-full flex">
      <AdminLoginLeft />
      <AdminLoginForm />
    </div>
  );
}
