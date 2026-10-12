import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { SvgSymbols } from "@/components/effects/Symbols";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · swift.in admin" }, robots: { index: false } };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <SvgSymbols />
      <AdminShell>{children}</AdminShell>
    </>
  );
}
