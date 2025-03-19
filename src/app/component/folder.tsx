interface Folder {
  name: string;
}

export default function Folder(folder: Folder) {
  return (
    <div>
      <div></div>
      <span>{folder.name}</span>
    </div>
  );
}