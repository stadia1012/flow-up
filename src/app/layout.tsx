import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Providers } from "@/app/component/providers";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "flow-up | 쎌바이오텍",
  description: "쎌바이오텍 업무 협업툴",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}