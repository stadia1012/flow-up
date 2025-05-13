import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Providers } from "@/app/component/providers";
import Header from "./component/header";
import SidebarWrapper from "./component/sidebar/sidebarWrapper";

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
        <Providers>
          <div className="flex flex-col h-full">
            <Header></Header>
            <div className="flex flex-row h-full">
              <SidebarWrapper />
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}