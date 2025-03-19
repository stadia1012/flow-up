import Header from "./component/header";
import Sidebar from "./component/sidebar";
import Main from "./component/main"

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <Header></Header>
      <div className="h-full">
        <Sidebar></Sidebar>
        <Main></Main>
      </div>
    </div>
  );
}
