import Header from "./component/header";
import Sidebar from "./component/sidebar/sidebar";
import Main from "./component/main"
import ModalRoot from "./component/modalRoot";

export default async function Home() {
  return (
    <>
      <div className="flex flex-col h-full">
        <Header></Header>
        <div className="h-full">
          <Sidebar></Sidebar>
          <Main></Main>
        </div>
      </div>
      <ModalRoot />
    </>
  );
}
