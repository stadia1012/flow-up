import Header from "../component/header";
import SidebarWrapper from "../component/sidebar/sidebarWrapper";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-full relative">
      <Header />
      <div id="content-container" className="flex flex-row h-full relative">
        <SidebarWrapper />
        {children}
      </div>
    </div>
  );
}