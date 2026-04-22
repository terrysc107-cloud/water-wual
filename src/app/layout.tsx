import type { Metadata } from "next";
import { AppProvider } from "@/components/providers/app-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clarix Water Intelligence",
  description:
    "Field-first water intelligence workspace for audits, findings, plans, and reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
