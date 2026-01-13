import type { Metadata } from "next";
import { Inter, Rajdhani } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

const rajdhani = Rajdhani({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-rajdhani',
});

export const metadata: Metadata = {
  title: "Karting Lap Time Analysis | Lahore Tracks",
  description: "Professional karting lap time analysis and leaderboards for Sportzilla Formula Karting and Apex Autodrome in Lahore, Pakistan. Track your performance, compare times, and climb the ranks.",
  keywords: ["karting", "lap times", "leaderboard", "sportzilla", "apex autodrome", "lahore", "racing"],
  authors: [{ name: "Karting Analysis Team" }],
  openGraph: {
    title: "Karting Lap Time Analysis | Lahore Tracks",
    description: "Professional karting lap time analysis and leaderboards for Lahore tracks",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${rajdhani.variable} antialiased min-h-screen racing-gradient`}>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
