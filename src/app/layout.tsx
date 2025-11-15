import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Providers } from "@/app/component/providers";
import AuthProvider from "./authProvider";
import { ToastProvider } from "./context/ToastContext";

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
    <html lang="ko">
      <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1"></meta>
      <body className="overflow-hidden">
        <AuthProvider>
          <Providers>
            <ToastProvider>
            {children}
            </ToastProvider>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}