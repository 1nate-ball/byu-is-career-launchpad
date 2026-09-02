import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BYU IS Career Launchpad",
  description:
    "Discover a promising information systems career path, understand the real work, and practice role-specific interviews.",
  applicationName: "BYU IS Career Launchpad",
  keywords: [
    "BYU Information Systems",
    "career discovery",
    "interview practice",
    "cybersecurity",
    "data analytics",
    "software development",
    "product management",
  ],
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: "#020b17",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
