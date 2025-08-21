import Header from "../component/header";
import SidebarWrapper from "../component/sidebar/sidebarWrapper";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-full relative">
      <Header />
      <div id="content-container" className="flex h-[calc(100%-53px)] w-full flex-row relative">
        <SidebarWrapper />
        {children}
      </div>
    </div>
  );
}