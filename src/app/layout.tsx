import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pakistan Karting Analysis System",
  description: "Professional karting lap time analysis and leaderboards for Sportzilla Formula Karting and Apex Autodrome in Lahore, Pakistan. Track your performance, compare times, and climb the ranks.",
  keywords: ["karting", "lap times", "leaderboard", "sportzilla", "apex autodrome", "lahore", "racing"],
  authors: [{ name: "Karting Analysis Team" }],
  openGraph: {
    title: "Lahore Karting Lap Analysis",
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
