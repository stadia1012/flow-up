import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Providers } from "@/app/component/providers";
import Header from "./component/header";
import SidebarWrapper from "./component/sidebar/sidebarWrapper";
import FieldSidebarWrapper from "./component/field-Sidebar/fieldSidebarWrapper";

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
      <body className="overflow-hidden">
        <Providers>
          <div className="flex flex-col h-full relative">
            <Header></Header>
            <div className="flex flex-row h-full relative">
              <SidebarWrapper />
              {children}
              <FieldSidebarWrapper />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}