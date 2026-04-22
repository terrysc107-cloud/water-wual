import { AuthGate } from "@/components/providers/auth-gate";
import { AppShell } from "@/components/layout/app-shell";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGate>
      <AppShell>{children}</AppShell>
    </AuthGate>
  );
}
