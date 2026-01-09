import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { getSession } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Navbahor Tekstil',
    default: 'Navbahor Tekstil Cluster',
  },
  description: "Zamonaviy Paxta Klasteri Boshqaruv Tizimi",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const isLoginPage = false; // We can detect this, but layout is global. 
  // However, for login page we might want a different layout or just hide sidebar.

  return (
    <html lang="uz" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex text-gray-900 bg-[#f8fafc]`}
        suppressHydrationWarning
      >
        {session && session.role !== 'BRIGADIER' && (
          <div className="no-print">
            <Sidebar user={session} />
          </div>
        )}
        <main className={`flex-1 ${session && session.role !== 'BRIGADIER' ? 'ml-72' : ''} min-h-screen relative z-0 print:m-0 print:p-0 main-content`}>
          {/* Ambient Background Elements */}
          <div className="fixed top-0 left-0 w-full h-full opacity-30 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-100 via-transparent to-transparent no-print ambient-bg" suppressHydrationWarning />
          <div className="fixed -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10 no-print ambient-bg" suppressHydrationWarning />

          <div className={`${session && session.role === 'BRIGADIER' ? 'p-0 w-full max-w-none' : 'max-w-7xl mx-auto w-full p-8'} print:p-0 print:max-w-none print:m-0`} suppressHydrationWarning>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
