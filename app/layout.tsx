import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "시편기도 · 보혈기도",
  description: "시편기도 및 보혈기도",
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 1, themeColor: "#FBF7F0",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body className="min-h-dvh">{children}</body></html>;
}
