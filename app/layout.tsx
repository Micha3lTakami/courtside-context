import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Courtside Context — Which games to watch tonight",
  description: "AI-powered second-screen companion that tells NBA fans which games to watch tonight and why.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className="min-h-full flex flex-col"
        style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}
      >
        {children}
      </body>
    </html>
  );
}
