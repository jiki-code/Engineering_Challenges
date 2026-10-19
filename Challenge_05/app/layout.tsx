import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Policy Summary Generator",
  description: "Generate clear, readable insurance policy summaries from JSON data",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  );
}
