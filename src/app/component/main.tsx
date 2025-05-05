import MainTable from './mainTable'
export default function Main() {
  return (
    <div className='flex flex-col p-[15px]'>
      <div className=''>
        <div className='text-[13.5px] text-gray-500 mb-[10px] font-[400]'>
          <span className='inline-block'>Project 1</span>
          <span className='inline-block ml-[10px] mr-[10px]'>/</span>
          <span className='inline-block'>Folder 1</span>
          <span className='inline-block ml-[10px] mr-[10px]'>/</span>
          <span className='inline-block'>Item 1</span>
        </div>
        <h1 className='text-[15px] font-[600] '>Item 1</h1>
      </div>
      <MainTable />
    </div>
  );
}