import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import DemoBanner from "@/components/DemoBanner";

export const metadata: Metadata = {
  title: "HIVE 🐝 | Shop smarter. Choose better.",
  description:
    "Personalized shopping decision-support platform comparing online quick commerce with nearby local kirana stores and recommending the best option.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-charcoal flex flex-col font-sans">
        <DemoBanner />
        <Navbar />
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
