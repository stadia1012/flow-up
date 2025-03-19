export default function Sidebar() {
  return (
    <nav className="flex flex-col w-[270px] bg-gray-50 shadow-md text-[#46484d] text-[14.5px] border-b-1 border-r-1 border-gray-300/85 h-full">
      <div className="border-b-1 border-gray-300/85 p-3 pl-4 basis-[120px]">
          <div className="font-[600]">Settings</div>
          <div className="font-[600]">Logs</div>
      </div>
      <div className="p-3 pl-4">
        <div className="font-[600]">Workspace</div>
        
        <div>Folder 2</div>
        <div>Folder 3</div>
      </div>
    </nav>
  );
}